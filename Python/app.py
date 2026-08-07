"""Backend do Mega Distrito — API REST sobre o banco MySQL (mega_distrito).

Expõe os mesmos dados hoje hard-coded em JS/data/*.js, mantendo os nomes
de campo do schema (database/schema.sql) para facilitar a migração do
front-end estático para consumo via API.
"""

import datetime
import decimal
import os
import random
import uuid

import mysql.connector
from flask import Flask, jsonify, request, send_from_directory
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

import db
import email_service
import geocoding


class JSONProviderMySQL(DefaultJSONProvider):
    """Serializa tipos que o MySQL retorna e o Flask não conhece por padrão:
    Decimal (colunas DECIMAL), datetime (colunas DATETIME/DATE) e
    timedelta (colunas TIME, ex: horario_abre/horario_fecha)."""

    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        if isinstance(obj, (datetime.datetime, datetime.date)):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        if isinstance(obj, datetime.timedelta):
            total_segundos = int(obj.total_seconds())
            horas, resto = divmod(total_segundos, 3600)
            minutos, segundos = divmod(resto, 60)
            return f"{horas:02d}:{minutos:02d}:{segundos:02d}"
        return super().default(obj)


app = Flask(__name__)
app.json = JSONProviderMySQL(app)

ORIGENS_PERMITIDAS = [
    "http://localhost",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://bonfimff.github.io",
    "https://megadistrito.exksvol.com",
    "http://megadistrito.exksvol.com",
]
CORS(app, origins=ORIGENS_PERMITIDAS)

# ---------------------------------------------------------
# UPLOAD DE ARQUIVOS (fotos e vídeos de produto)
# ---------------------------------------------------------
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.config["MAX_CONTENT_LENGTH"] = 30 * 1024 * 1024  # 30 MB por requisição

_EXTENSOES_PERMITIDAS = {
    "jpg", "jpeg", "png", "webp", "gif",  # fotos
    "mp4", "webm", "mov",                  # vídeos
}


def _extensao_valida(nome_arquivo):
    return "." in nome_arquivo and nome_arquivo.rsplit(".", 1)[1].lower() in _EXTENSOES_PERMITIDAS


@app.post("/api/upload")
def upload_arquivo():
    arquivo = request.files.get("arquivo")
    if not arquivo or not arquivo.filename:
        return jsonify({"erro": "Nenhum arquivo enviado"}), 400
    if not _extensao_valida(arquivo.filename):
        return jsonify({"erro": "Formato de arquivo não suportado"}), 400

    extensao = secure_filename(arquivo.filename).rsplit(".", 1)[1].lower()
    nome_final = f"{uuid.uuid4().hex}.{extensao}"
    arquivo.save(os.path.join(UPLOAD_DIR, nome_final))

    url = f"{request.url_root.rstrip('/')}/uploads/{nome_final}"
    return jsonify({"url": url}), 201


@app.get("/uploads/<path:nome_arquivo>")
def servir_upload(nome_arquivo):
    return send_from_directory(UPLOAD_DIR, nome_arquivo)


# ---------------------------------------------------------
# CATEGORIAS
# ---------------------------------------------------------
@app.get("/api/categorias")
def listar_categorias():
    return jsonify(db.query("SELECT * FROM categorias"))


# ---------------------------------------------------------
# ITENS (produtos e serviços)
# ---------------------------------------------------------
@app.get("/api/itens")
def listar_itens():
    tipo = request.args.get("tipo")
    loja_id = request.args.get("loja_id")
    categoria = request.args.get("categoria")
    bazar = request.args.get("bazar")  # '1' = só itens do bazar (usuario_id, condicao)
    usuario_id = request.args.get("usuario_id")

    sql = """
        SELECT i.*, l.nome AS loja_nome, u.nome AS vendedor_nome
        FROM itens i
        LEFT JOIN lojas l ON l.id = i.loja_id
        LEFT JOIN usuarios u ON u.id = i.usuario_id
        WHERE 1=1
    """
    params = []
    if tipo:
        sql += " AND i.tipo = %s"
        params.append(tipo)
    if loja_id:
        sql += " AND i.loja_id = %s"
        params.append(loja_id)
    if categoria:
        sql += " AND i.categoria = %s"
        params.append(categoria)
    if usuario_id:
        sql += " AND i.usuario_id = %s"
        params.append(usuario_id)
    if bazar == "1":
        sql += " AND i.usuario_id IS NOT NULL AND i.condicao IS NOT NULL"
    elif bazar == "0":
        sql += " AND i.loja_id IS NOT NULL"

    return jsonify(db.query(sql, params))


def _anexar_relacionados_item(item):
    """Preenche `fotos` (galeria, em ordem) e `variacoes` de um item já carregado."""
    if not item:
        return item
    item["fotos"] = [
        f["url"] for f in db.query(
            "SELECT url FROM item_fotos WHERE item_id = %s ORDER BY ordem, id", (item["id"],)
        )
    ]
    item["variacoes"] = db.query(
        "SELECT id, tipo, valor, estoque, preco FROM item_variacoes WHERE item_id = %s ORDER BY id",
        (item["id"],),
    )
    return item


def _salvar_fotos_e_variacoes(item_id, dados):
    """Substitui a galeria de fotos e as variações do item pelas enviadas (se as chaves vierem no payload)."""
    if "fotos" in dados:
        db.execute("DELETE FROM item_fotos WHERE item_id = %s", (item_id,))
        for ordem, url in enumerate(dados["fotos"] or []):
            if url:
                db.execute(
                    "INSERT INTO item_fotos (item_id, url, ordem) VALUES (%s, %s, %s)",
                    (item_id, url, ordem),
                )

    if "variacoes" in dados:
        db.execute("DELETE FROM item_variacoes WHERE item_id = %s", (item_id,))
        for variacao in dados["variacoes"] or []:
            if not variacao.get("valor"):
                continue
            db.execute(
                """INSERT INTO item_variacoes (item_id, tipo, valor, estoque, preco)
                   VALUES (%s, %s, %s, %s, %s)""",
                (
                    item_id,
                    variacao.get("tipo") or "Variação",
                    variacao.get("valor"),
                    int(variacao.get("estoque") or 0),
                    variacao.get("preco") or None,
                ),
            )


@app.get("/api/itens/<int:item_id>")
def obter_item(item_id):
    item = db.query("SELECT * FROM itens WHERE id = %s", (item_id,), fetchone=True)
    if not item:
        return jsonify({"erro": "Item não encontrado"}), 404
    return jsonify(_anexar_relacionados_item(item))


_CAMPOS_ITEM = [
    "tipo", "nome", "descricao", "preco", "preco_antigo", "foto_url", "video_url",
    "categoria", "subcategoria", "marca", "quantidade", "duracao_min", "cor", "voltagem",
    "entrega", "retirada", "condicao", "bairro",
]


@app.post("/api/itens")
def criar_item():
    dados = request.get_json(force=True) or {}
    campos = {chave: dados.get(chave) for chave in _CAMPOS_ITEM}
    foto_capa = campos["foto_url"] or next(iter(dados.get("fotos") or []), None)
    item_id = db.execute(
        """INSERT INTO itens
           (loja_id, usuario_id, tipo, nome, descricao, preco, preco_antigo,
            foto_url, video_url, categoria, subcategoria, marca, quantidade, duracao_min,
            cor, voltagem, entrega, retirada, condicao, bairro)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (
            dados.get("loja_id"), dados.get("usuario_id"),
            campos["tipo"] or "produto", campos["nome"], campos["descricao"],
            campos["preco"] or 0, campos["preco_antigo"], foto_capa,
            campos["video_url"], campos["categoria"], campos["subcategoria"],
            campos["marca"], campos["quantidade"], campos["duracao_min"], campos["cor"], campos["voltagem"],
            int(bool(campos["entrega"])) if campos["entrega"] is not None else 1,
            int(bool(campos["retirada"])) if campos["retirada"] is not None else 1,
            campos["condicao"], campos["bairro"],
        ),
    )
    _salvar_fotos_e_variacoes(item_id, dados)
    item = db.query("SELECT * FROM itens WHERE id = %s", (item_id,), fetchone=True)
    return jsonify(_anexar_relacionados_item(item)), 201


@app.patch("/api/itens/<int:item_id>")
def atualizar_item(item_id):
    dados = request.get_json(force=True) or {}
    campos = {chave: dados[chave] for chave in _CAMPOS_ITEM if chave in dados}

    if "foto_url" not in campos and dados.get("fotos"):
        campos["foto_url"] = dados["fotos"][0]

    if not campos and "fotos" not in dados and "variacoes" not in dados:
        return jsonify({"erro": "Nenhum campo para atualizar"}), 400

    if campos:
        set_clause = ", ".join(f"{campo} = %s" for campo in campos)
        db.execute(f"UPDATE itens SET {set_clause} WHERE id = %s", list(campos.values()) + [item_id])

    _salvar_fotos_e_variacoes(item_id, dados)

    item = db.query("SELECT * FROM itens WHERE id = %s", (item_id,), fetchone=True)
    if not item:
        return jsonify({"erro": "Item não encontrado"}), 404
    return jsonify(_anexar_relacionados_item(item))


@app.delete("/api/itens/<int:item_id>")
def remover_item(item_id):
    try:
        db.execute("DELETE FROM itens WHERE id = %s", (item_id,))
    except mysql.connector.errors.IntegrityError:
        return jsonify({"erro": "Não é possível remover: este item já tem pedidos vinculados"}), 409
    return "", 204


# ---------------------------------------------------------
# LOJAS
# ---------------------------------------------------------
@app.get("/api/lojas")
def listar_lojas():
    return jsonify(db.query("SELECT * FROM lojas"))


@app.get("/api/lojas/<slug>")
def obter_loja(slug):
    loja = db.query("SELECT * FROM lojas WHERE slug = %s", (slug,), fetchone=True)
    if not loja:
        return jsonify({"erro": "Loja não encontrada"}), 404

    loja["itens"] = [
        _anexar_relacionados_item(item)
        for item in db.query("SELECT * FROM itens WHERE loja_id = %s", (loja["id"],))
    ]
    loja["filtros"] = db.query("SELECT * FROM loja_filtros WHERE loja_id = %s", (loja["id"],))
    for filtro in loja["filtros"]:
        filtro["itens_manuais"] = db.query(
            "SELECT item_nome FROM loja_filtro_itens WHERE filtro_id = %s", (filtro["id"],)
        )
    loja["dias_fechados"] = db.query(
        "SELECT data FROM loja_dias_fechados WHERE loja_id = %s", (loja["id"],)
    )
    return jsonify(loja)


_CAMPOS_LOJA = [
    "nome", "categoria", "perfil", "subtitulo", "endereco", "endereco_url", "telefone",
    "whatsapp", "cor_primaria", "cor_destaque", "banner_url", "card_url",
    "icone_url", "horario_abre", "horario_fecha", "modo_card",
]


@app.patch("/api/lojas/<int:loja_id>")
def atualizar_loja(loja_id):
    dados = request.get_json(force=True) or {}
    campos = {chave: dados[chave] for chave in _CAMPOS_LOJA if chave in dados}

    if "endereco" in campos and campos["endereco"]:
        campos["lat"], campos["lng"] = geocoding.geocodificar_endereco(campos["endereco"])

    if campos:
        set_clause = ", ".join(f"{campo} = %s" for campo in campos)
        db.execute(f"UPDATE lojas SET {set_clause} WHERE id = %s", list(campos.values()) + [loja_id])

    if "filtros" in dados:
        db.execute("DELETE FROM loja_filtros WHERE loja_id = %s", (loja_id,))
        for filtro in dados["filtros"]:
            filtro_id = db.execute(
                "INSERT INTO loja_filtros (loja_id, nome, valor) VALUES (%s, %s, %s)",
                (loja_id, filtro.get("name") or filtro.get("nome"), filtro.get("value") or filtro.get("valor")),
            )
            for item_nome in filtro.get("manualItems", []):
                db.execute(
                    "INSERT INTO loja_filtro_itens (filtro_id, item_nome) VALUES (%s, %s)",
                    (filtro_id, item_nome),
                )

    if "dias_fechados" in dados:
        db.execute("DELETE FROM loja_dias_fechados WHERE loja_id = %s", (loja_id,))
        for data in dados["dias_fechados"]:
            db.execute(
                "INSERT INTO loja_dias_fechados (loja_id, data) VALUES (%s, %s)",
                (loja_id, data),
            )

    loja = db.query("SELECT * FROM lojas WHERE id = %s", (loja_id,), fetchone=True)
    if not loja:
        return jsonify({"erro": "Loja não encontrada"}), 404
    return jsonify(loja)


# ---------------------------------------------------------
# USUÁRIOS (cadastro/login)
# ---------------------------------------------------------
@app.post("/api/usuarios/cadastro")
def cadastrar_usuario():
    dados = request.get_json(force=True) or {}
    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")
    telefone = dados.get("telefone")

    if not nome or not email or not senha:
        return jsonify({"erro": "nome, email e senha são obrigatórios"}), 400

    existente = db.query("SELECT id FROM usuarios WHERE email = %s", (email,), fetchone=True)
    if existente:
        return jsonify({"erro": "E-mail já cadastrado"}), 409

    senha_hash = generate_password_hash(senha)
    usuario_id = db.execute(
        "INSERT INTO usuarios (nome, email, senha_hash, telefone) VALUES (%s, %s, %s, %s)",
        (nome, email, senha_hash, telefone),
    )

    codigo = gerar_codigo_verificacao()
    db.execute(
        """INSERT INTO codigos_verificacao (usuario_id, codigo, tipo, expira_em)
           VALUES (%s, %s, 'confirmacao_cadastro', DATE_ADD(NOW(), INTERVAL 15 MINUTE))""",
        (usuario_id, codigo),
    )
    email_service.enviar_codigo_confirmacao(email, nome, codigo)

    return jsonify({"email": email, "aguardando_confirmacao": True}), 201


@app.post("/api/usuarios/confirmar-cadastro")
def confirmar_cadastro():
    dados = request.get_json(force=True) or {}
    email = dados.get("email")
    codigo = dados.get("codigo")

    if not email or not codigo:
        return jsonify({"erro": "email e codigo são obrigatórios"}), 400

    usuario = db.query("SELECT * FROM usuarios WHERE email = %s", (email,), fetchone=True)
    if not usuario:
        return jsonify({"erro": "Código inválido ou expirado"}), 400

    registro = db.query(
        """SELECT id FROM codigos_verificacao
           WHERE usuario_id = %s AND codigo = %s AND tipo = 'confirmacao_cadastro'
             AND usado = 0 AND expira_em > NOW()
           ORDER BY id DESC LIMIT 1""",
        (usuario["id"], codigo),
        fetchone=True,
    )
    if not registro:
        return jsonify({"erro": "Código inválido ou expirado"}), 400

    db.execute("UPDATE usuarios SET email_verificado = 1 WHERE id = %s", (usuario["id"],))
    db.execute("UPDATE codigos_verificacao SET usado = 1 WHERE id = %s", (registro["id"],))

    return jsonify({"id": usuario["id"], "nome": usuario["nome"], "email": usuario["email"]})


@app.post("/api/usuarios/reenviar-codigo-cadastro")
def reenviar_codigo_cadastro():
    dados = request.get_json(force=True) or {}
    email = dados.get("email")
    if not email:
        return jsonify({"erro": "email é obrigatório"}), 400

    usuario = db.query("SELECT id, nome, email_verificado FROM usuarios WHERE email = %s", (email,), fetchone=True)
    if usuario and not usuario["email_verificado"]:
        codigo = gerar_codigo_verificacao()
        db.execute(
            """INSERT INTO codigos_verificacao (usuario_id, codigo, tipo, expira_em)
               VALUES (%s, %s, 'confirmacao_cadastro', DATE_ADD(NOW(), INTERVAL 15 MINUTE))""",
            (usuario["id"], codigo),
        )
        email_service.enviar_codigo_confirmacao(email, usuario["nome"], codigo)

    return jsonify({"mensagem": "Se o e-mail existir e ainda não estiver confirmado, um novo código foi enviado."})


@app.post("/api/usuarios/login")
def login_usuario():
    dados = request.get_json(force=True) or {}
    email = dados.get("email")
    senha = dados.get("senha")

    usuario = db.query("SELECT * FROM usuarios WHERE email = %s", (email,), fetchone=True)
    if not usuario or not check_password_hash(usuario["senha_hash"], senha or ""):
        return jsonify({"erro": "E-mail ou senha inválidos"}), 401

    if not usuario["email_verificado"]:
        return jsonify({"erro": "Confirme seu e-mail antes de entrar.", "email_nao_confirmado": True, "email": email}), 403

    usuario.pop("senha_hash")
    return jsonify(usuario)


# ---------------------------------------------------------
# RECUPERAÇÃO DE SENHA (código de 6 dígitos por e-mail)
# ---------------------------------------------------------
def gerar_codigo_verificacao():
    return f"{random.randint(0, 999999):06d}"


@app.post("/api/usuarios/recuperar-senha")
def solicitar_recuperacao_senha():
    dados = request.get_json(force=True) or {}
    email = dados.get("email")
    if not email:
        return jsonify({"erro": "email é obrigatório"}), 400

    usuario = db.query("SELECT id, nome FROM usuarios WHERE email = %s", (email,), fetchone=True)
    if usuario:
        codigo = gerar_codigo_verificacao()
        db.execute(
            """INSERT INTO codigos_verificacao (usuario_id, codigo, tipo, expira_em)
               VALUES (%s, %s, 'recuperacao_senha', DATE_ADD(NOW(), INTERVAL 15 MINUTE))""",
            (usuario["id"], codigo),
        )
        email_service.enviar_codigo_recuperacao(email, usuario["nome"], codigo)

    # Resposta genérica sempre igual, para não revelar se o e-mail existe na base.
    return jsonify({"mensagem": "Se o e-mail existir em nossa base, um código foi enviado."})


@app.post("/api/usuarios/redefinir-senha")
def redefinir_senha():
    dados = request.get_json(force=True) or {}
    email = dados.get("email")
    codigo = dados.get("codigo")
    nova_senha = dados.get("nova_senha")

    if not email or not codigo or not nova_senha:
        return jsonify({"erro": "email, codigo e nova_senha são obrigatórios"}), 400

    usuario = db.query("SELECT id FROM usuarios WHERE email = %s", (email,), fetchone=True)
    if not usuario:
        return jsonify({"erro": "Código inválido ou expirado"}), 400

    registro = db.query(
        """SELECT id FROM codigos_verificacao
           WHERE usuario_id = %s AND codigo = %s AND tipo = 'recuperacao_senha'
             AND usado = 0 AND expira_em > NOW()
           ORDER BY id DESC LIMIT 1""",
        (usuario["id"], codigo),
        fetchone=True,
    )
    if not registro:
        return jsonify({"erro": "Código inválido ou expirado"}), 400

    senha_hash = generate_password_hash(nova_senha)
    db.execute("UPDATE usuarios SET senha_hash = %s WHERE id = %s", (senha_hash, usuario["id"]))
    db.execute("UPDATE codigos_verificacao SET usado = 1 WHERE id = %s", (registro["id"],))

    return jsonify({"mensagem": "Senha redefinida com sucesso."})


# ---------------------------------------------------------
# ENDEREÇOS
# ---------------------------------------------------------
@app.get("/api/usuarios/<int:usuario_id>/enderecos")
def listar_enderecos(usuario_id):
    return jsonify(db.query("SELECT * FROM enderecos WHERE usuario_id = %s", (usuario_id,)))


@app.post("/api/usuarios/<int:usuario_id>/enderecos")
def criar_endereco(usuario_id):
    dados = request.get_json(force=True) or {}
    lat, lng = geocoding.geocodificar_endereco(dados.get("rua"), dados.get("bairro"), dados.get("cidade"))
    endereco_id = db.execute(
        """INSERT INTO enderecos (usuario_id, apelido, rua, bairro, cidade, cep, lat, lng, padrao)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (
            usuario_id,
            dados.get("apelido", "Casa"),
            dados.get("rua"),
            dados.get("bairro"),
            dados.get("cidade"),
            dados.get("cep"),
            lat,
            lng,
            dados.get("padrao", False),
        ),
    )
    return jsonify({"id": endereco_id}), 201


@app.delete("/api/enderecos/<int:endereco_id>")
def remover_endereco(endereco_id):
    db.execute("DELETE FROM enderecos WHERE id = %s", (endereco_id,))
    return "", 204


# ---------------------------------------------------------
# PEDIDOS
# ---------------------------------------------------------
STATUS_VALIDOS = {"aguardando_pagamento", "preparando", "a_caminho", "a_avaliar", "concluido"}


@app.get("/api/usuarios/<int:usuario_id>/pedidos")
def listar_pedidos_usuario(usuario_id):
    status = request.args.get("status")
    sql = """
        SELECT p.*, i.nome AS item_nome, l.nome AS loja_nome
        FROM pedidos p
        JOIN itens i ON i.id = p.item_id
        LEFT JOIN lojas l ON l.id = p.loja_id
        WHERE p.usuario_id = %s
    """
    params = [usuario_id]
    if status:
        sql += " AND p.status = %s"
        params.append(status)
    sql += " ORDER BY p.criado_em DESC"
    return jsonify(db.query(sql, params))


@app.post("/api/pedidos")
def criar_pedido():
    dados = request.get_json(force=True) or {}
    pedido_id = db.execute(
        """INSERT INTO pedidos (usuario_id, loja_id, item_id, tipo, valor)
           VALUES (%s, %s, %s, %s, %s)""",
        (
            dados.get("usuario_id"),
            dados.get("loja_id"),
            dados.get("item_id"),
            dados.get("tipo"),
            dados.get("valor"),
        ),
    )
    db.execute(
        "INSERT INTO pedido_status_historico (pedido_id, status) VALUES (%s, %s)",
        (pedido_id, "aguardando_pagamento"),
    )
    return jsonify({"id": pedido_id}), 201


@app.patch("/api/pedidos/<int:pedido_id>/status")
def atualizar_status_pedido(pedido_id):
    dados = request.get_json(force=True) or {}
    status = dados.get("status")
    if status not in STATUS_VALIDOS:
        return jsonify({"erro": f"status inválido, use um de {sorted(STATUS_VALIDOS)}"}), 400

    db.execute("UPDATE pedidos SET status = %s WHERE id = %s", (status, pedido_id))
    db.execute(
        "INSERT INTO pedido_status_historico (pedido_id, status) VALUES (%s, %s)",
        (pedido_id, status),
    )
    return jsonify({"id": pedido_id, "status": status})


# ---------------------------------------------------------
# ENTREGADORES / ENTREGAS (HTML/entregador.html — painel estilo Uber/99)
# ---------------------------------------------------------
@app.post("/api/entregadores/cadastro")
def cadastrar_entregador():
    dados = request.get_json(force=True) or {}
    usuario_id = dados.get("usuario_id")
    if not usuario_id:
        return jsonify({"erro": "usuario_id é obrigatório"}), 400

    existente = db.query("SELECT * FROM entregadores WHERE usuario_id = %s", (usuario_id,), fetchone=True)
    if existente:
        return jsonify(existente)

    entregador_id = db.execute(
        "INSERT INTO entregadores (usuario_id, veiculo, placa) VALUES (%s, %s, %s)",
        (usuario_id, dados.get("veiculo") or "moto", dados.get("placa")),
    )
    entregador = db.query("SELECT * FROM entregadores WHERE id = %s", (entregador_id,), fetchone=True)
    return jsonify(entregador), 201


@app.get("/api/entregadores/usuario/<int:usuario_id>")
def obter_entregador_por_usuario(usuario_id):
    entregador = db.query("SELECT * FROM entregadores WHERE usuario_id = %s", (usuario_id,), fetchone=True)
    if not entregador:
        return jsonify({"erro": "Entregador não encontrado"}), 404
    return jsonify(entregador)


@app.patch("/api/entregadores/<int:entregador_id>/disponibilidade")
def atualizar_disponibilidade_entregador(entregador_id):
    dados = request.get_json(force=True) or {}
    db.execute(
        "UPDATE entregadores SET disponivel = %s WHERE id = %s",
        (int(bool(dados.get("disponivel"))), entregador_id),
    )
    return jsonify({"id": entregador_id, "disponivel": bool(dados.get("disponivel"))})


@app.patch("/api/entregadores/<int:entregador_id>/posicao")
def atualizar_posicao_entregador(entregador_id):
    dados = request.get_json(force=True) or {}
    lat, lng = dados.get("lat"), dados.get("lng")
    if lat is None or lng is None:
        return jsonify({"erro": "lat e lng são obrigatórios"}), 400
    db.execute("UPDATE entregadores SET lat = %s, lng = %s WHERE id = %s", (lat, lng, entregador_id))
    return "", 204


@app.get("/api/entregas/disponiveis")
def listar_entregas_disponiveis():
    """Pedidos prontos para retirada (status='preparando', sem entregador ainda,
    item com entrega habilitada) — ordenados por distância quando o entregador
    informa sua posição atual (lat/lng); senão, pelos mais recentes."""
    lat = request.args.get("lat", type=float)
    lng = request.args.get("lng", type=float)

    campos_base = """
        p.id, p.valor, p.criado_em, p.loja_id, p.endereco_id,
        i.nome AS item_nome,
        l.nome AS loja_nome, l.endereco AS loja_endereco, l.lat AS loja_lat, l.lng AS loja_lng,
        e.rua AS cliente_rua, e.bairro AS cliente_bairro, e.cidade AS cliente_cidade,
        e.lat AS cliente_lat, e.lng AS cliente_lng
    """
    filtro_base = """
        FROM pedidos p
        JOIN itens i ON i.id = p.item_id
        JOIN lojas l ON l.id = p.loja_id
        LEFT JOIN enderecos e ON e.id = p.endereco_id
        WHERE p.status = 'preparando'
          AND p.entregador_id IS NULL
          AND i.entrega = 1
          AND l.lat IS NOT NULL AND l.lng IS NOT NULL
    """

    if lat is not None and lng is not None:
        sql = f"""
            SELECT {campos_base},
                6371 * ACOS(LEAST(1, GREATEST(-1,
                    COS(RADIANS(%s)) * COS(RADIANS(l.lat)) * COS(RADIANS(l.lng) - RADIANS(%s))
                    + SIN(RADIANS(%s)) * SIN(RADIANS(l.lat))
                ))) AS distancia_km
            {filtro_base}
            HAVING distancia_km <= 20
            ORDER BY distancia_km ASC
        """
        params = [lat, lng, lat]
    else:
        sql = f"SELECT {campos_base}, NULL AS distancia_km {filtro_base} ORDER BY p.criado_em DESC"
        params = []

    return jsonify(db.query(sql, params))


@app.post("/api/entregas/<int:pedido_id>/aceitar")
def aceitar_entrega(pedido_id):
    dados = request.get_json(force=True) or {}
    entregador_id = dados.get("entregador_id")
    if not entregador_id:
        return jsonify({"erro": "entregador_id é obrigatório"}), 400

    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE pedidos SET entregador_id = %s
               WHERE id = %s AND entregador_id IS NULL AND status = 'preparando'""",
            (entregador_id, pedido_id),
        )
        conn.commit()
        aceito = cursor.rowcount > 0
        cursor.close()
    finally:
        conn.close()

    if not aceito:
        return jsonify({"erro": "Este pedido já foi aceito por outro entregador ou não está mais disponível"}), 409

    pedido = db.query("SELECT * FROM pedidos WHERE id = %s", (pedido_id,), fetchone=True)
    return jsonify(pedido)


@app.get("/api/entregadores/<int:entregador_id>/entrega-atual")
def obter_entrega_atual(entregador_id):
    pedido = db.query(
        """SELECT p.*, i.nome AS item_nome,
               l.nome AS loja_nome, l.endereco AS loja_endereco, l.lat AS loja_lat, l.lng AS loja_lng,
               e.rua AS cliente_rua, e.bairro AS cliente_bairro, e.cidade AS cliente_cidade,
               e.lat AS cliente_lat, e.lng AS cliente_lng,
               u.nome AS cliente_nome, u.telefone AS cliente_telefone
           FROM pedidos p
           JOIN itens i ON i.id = p.item_id
           JOIN lojas l ON l.id = p.loja_id
           JOIN usuarios u ON u.id = p.usuario_id
           LEFT JOIN enderecos e ON e.id = p.endereco_id
           WHERE p.entregador_id = %s AND p.status IN ('preparando', 'a_caminho')
           ORDER BY p.criado_em DESC LIMIT 1""",
        (entregador_id,),
        fetchone=True,
    )
    return jsonify(pedido)


@app.patch("/api/entregas/<int:pedido_id>/retirado")
def confirmar_retirada_entrega(pedido_id):
    db.execute("UPDATE pedidos SET status = 'a_caminho' WHERE id = %s AND status = 'preparando'", (pedido_id,))
    db.execute("INSERT INTO pedido_status_historico (pedido_id, status) VALUES (%s, 'a_caminho')", (pedido_id,))
    return jsonify({"id": pedido_id, "status": "a_caminho"})


@app.patch("/api/entregas/<int:pedido_id>/entregue")
def confirmar_entrega_ao_cliente(pedido_id):
    db.execute("UPDATE pedidos SET status = 'a_avaliar' WHERE id = %s AND status = 'a_caminho'", (pedido_id,))
    db.execute("INSERT INTO pedido_status_historico (pedido_id, status) VALUES (%s, 'a_avaliar')", (pedido_id,))
    return jsonify({"id": pedido_id, "status": "a_avaliar"})


# ---------------------------------------------------------
# AVALIAÇÕES
# ---------------------------------------------------------
@app.post("/api/pedidos/<int:pedido_id>/avaliacao")
def criar_avaliacao(pedido_id):
    dados = request.get_json(force=True) or {}
    nota = dados.get("nota")
    if not isinstance(nota, int) or not (1 <= nota <= 5):
        return jsonify({"erro": "nota deve ser um inteiro entre 1 e 5"}), 400

    avaliacao_id = db.execute(
        "INSERT INTO avaliacoes (pedido_id, usuario_id, nota, comentario) VALUES (%s, %s, %s, %s)",
        (pedido_id, dados.get("usuario_id"), nota, dados.get("comentario")),
    )
    db.execute("UPDATE pedidos SET status = 'concluido' WHERE id = %s", (pedido_id,))
    return jsonify({"id": avaliacao_id}), 201


# ---------------------------------------------------------
# MENSAGENS (interações e clientes que compraram)
# ---------------------------------------------------------
@app.get("/api/lojas/<int:loja_id>/mensagens")
def listar_mensagens_loja(loja_id):
    tipo = request.args.get("tipo")
    sql = """
        SELECT m.*, u.nome AS cliente_nome, i.nome AS item_nome
        FROM mensagens m
        JOIN usuarios u ON u.id = m.usuario_id
        LEFT JOIN itens i ON i.id = m.item_id
        WHERE m.loja_id = %s
    """
    params = [loja_id]
    if tipo in ("compra", "interacao"):
        sql += " AND m.tipo = %s"
        params.append(tipo)
    sql += " ORDER BY m.criado_em DESC"

    mensagens = db.query(sql, params)
    for mensagem in mensagens:
        mensagem["respostas"] = db.query(
            "SELECT * FROM mensagem_respostas WHERE mensagem_id = %s ORDER BY criado_em",
            (mensagem["id"],),
        )
        mensagem["anexos"] = db.query(
            "SELECT * FROM mensagem_anexos WHERE mensagem_id = %s", (mensagem["id"],)
        )
    return jsonify(mensagens)


@app.post("/api/mensagens/<int:mensagem_id>/respostas")
def responder_mensagem(mensagem_id):
    dados = request.get_json(force=True) or {}
    resposta_id = db.execute(
        "INSERT INTO mensagem_respostas (mensagem_id, texto) VALUES (%s, %s)",
        (mensagem_id, dados.get("texto")),
    )
    return jsonify({"id": resposta_id}), 201


@app.patch("/api/mensagens/<int:mensagem_id>/lida")
def marcar_mensagem_lida(mensagem_id):
    db.execute("UPDATE mensagens SET lida = 1 WHERE id = %s", (mensagem_id,))
    return "", 204


# ---------------------------------------------------------
# LOJA DE APLICATIVOS
# ---------------------------------------------------------
@app.get("/api/apps")
def listar_apps():
    return jsonify(db.query("SELECT * FROM apps_catalogo"))


@app.get("/api/usuarios/<int:usuario_id>/atalhos")
def listar_atalhos(usuario_id):
    sql = """
        SELECT a.* FROM apps_catalogo a
        JOIN atalhos_usuario u ON u.app_id = a.id
        WHERE u.usuario_id = %s
    """
    return jsonify(db.query(sql, (usuario_id,)))


@app.post("/api/usuarios/<int:usuario_id>/atalhos/<int:app_id>")
def fixar_atalho(usuario_id, app_id):
    db.execute(
        "INSERT IGNORE INTO atalhos_usuario (usuario_id, app_id) VALUES (%s, %s)",
        (usuario_id, app_id),
    )
    return "", 204


@app.delete("/api/usuarios/<int:usuario_id>/atalhos/<int:app_id>")
def remover_atalho(usuario_id, app_id):
    db.execute(
        "DELETE FROM atalhos_usuario WHERE usuario_id = %s AND app_id = %s",
        (usuario_id, app_id),
    )
    return "", 204


# ---------------------------------------------------------
# PROFISSIONAIS DE SERVIÇO (perfis autônomos — HTML/servicos.html)
# ---------------------------------------------------------
@app.get("/api/profissionais")
def listar_profissionais():
    especialidade = request.args.get("especialidade")

    sql = """
        SELECT p.*, u.nome, u.telefone AS telefone_usuario
        FROM perfis_profissionais p
        JOIN usuarios u ON u.id = p.usuario_id
        WHERE 1=1
    """
    params = []
    if especialidade:
        sql += " AND p.especialidade = %s"
        params.append(especialidade)

    perfis = db.query(sql, params)
    for perfil in perfis:
        tags = db.query(
            "SELECT tag FROM perfil_profissional_tags WHERE perfil_id = %s", (perfil["id"],)
        )
        perfil["tags"] = [t["tag"] for t in tags]

    return jsonify(perfis)


# ---------------------------------------------------------
# VAGAS DE EMPREGO (HTML/servicos.html)
# ---------------------------------------------------------
@app.get("/api/vagas")
def listar_vagas():
    area = request.args.get("area")

    sql = "SELECT * FROM vagas_emprego WHERE 1=1"
    params = []
    if area:
        sql += " AND area = %s"
        params.append(area)
    sql += " ORDER BY criado_em DESC"

    return jsonify(db.query(sql, params))


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
