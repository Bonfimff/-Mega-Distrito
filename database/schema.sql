-- =========================================================
-- MEGA DISTRITO — Banco de dados (MySQL 8+)
-- ---------------------------------------------------------
-- Este schema espelha as estruturas de dados hoje hard-coded
-- em JS/data/*.js e no estado em memória de gerenciamento.js /
-- conta.js. A ideia é substituir aqueles arquivos por consultas
-- a este banco quando o backend existir, mantendo os mesmos
-- nomes de campo sempre que possível para facilitar a migração.
--
-- Convenções:
--   - utf8mb4 em tudo (emojis e acentuação sem surpresa)
--   - InnoDB (chaves estrangeiras)
--   - Preços em DECIMAL(10,2), nunca FLOAT
--   - Timestamps em todas as tabelas principais
-- =========================================================

CREATE DATABASE IF NOT EXISTS mega_distrito
	CHARACTER SET utf8mb4
	COLLATE utf8mb4_unicode_ci;

USE mega_distrito;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- USUÁRIOS (clientes que compram no marketplace)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
	id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	nome          VARCHAR(120)  NOT NULL,
	email         VARCHAR(160)  NOT NULL UNIQUE,
	senha_hash    VARCHAR(255)  NOT NULL,
	telefone      VARCHAR(20)   NULL,
	email_verificado TINYINT(1) NOT NULL DEFAULT 0,
	criado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
	atualizado_em DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ENDEREÇOS (um usuário pode ter vários; ver HTML/conta.html)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS enderecos;
CREATE TABLE enderecos (
	id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id  INT UNSIGNED NOT NULL,
	apelido     VARCHAR(40)  NOT NULL DEFAULT 'Casa', -- Casa / Trabalho / Outro
	rua         VARCHAR(160) NOT NULL,
	bairro      VARCHAR(80)  NOT NULL,
	cidade      VARCHAR(80)  NOT NULL,
	cep         VARCHAR(12)  NOT NULL,
	lat         DECIMAL(10,7) NULL, -- geocodificado ao criar (ver Python/geocoding.py)
	lng         DECIMAL(10,7) NULL,
	padrao      TINYINT(1)   NOT NULL DEFAULT 0,
	criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_enderecos_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- CATEGORIAS (ver JS/data/categorias.js)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS categorias;
CREATE TABLE categorias (
	id     VARCHAR(40)  PRIMARY KEY, -- slug, ex: 'eletronicos'
	nome   VARCHAR(80)  NOT NULL,
	icone  VARCHAR(60)  NOT NULL     -- classe Font Awesome, ex: 'fas fa-laptop'
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- LOJAS (estabelecimentos com página própria — ver JS/data/lojas.js
-- e GM_DEFAULT em JS/gerenciamento.js, mesmo schema)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS lojas;
CREATE TABLE lojas (
	id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	slug           VARCHAR(80)   NOT NULL UNIQUE, -- usado em loja.html?id=<slug>
	nome           VARCHAR(120)  NOT NULL,
	categoria      VARCHAR(80)   NOT NULL,        -- ex: 'Alimentação', 'Beleza e Saúde'
	perfil         VARCHAR(40)   NOT NULL DEFAULT 'produtos', -- ver JS/data/perfis-loja.js
	subtitulo      VARCHAR(160)  NULL,
	endereco       VARCHAR(200)  NULL,
	endereco_url   VARCHAR(255)  NULL,
	lat            DECIMAL(10,7) NULL, -- geocodificado ao salvar (ver Python/geocoding.py)
	lng            DECIMAL(10,7) NULL,
	telefone       VARCHAR(20)   NULL,
	whatsapp       VARCHAR(20)   NULL,
	cor_primaria   CHAR(7)       NOT NULL DEFAULT '#2e7d32',
	cor_destaque   CHAR(7)       NOT NULL DEFAULT '#1565c0',
	banner_url     VARCHAR(255)  NULL,
	card_url       VARCHAR(255)  NULL,
	icone_url      VARCHAR(255)  NULL,
	horario_abre   TIME          NOT NULL DEFAULT '09:00:00',
	horario_fecha  TIME          NOT NULL DEFAULT '18:00:00',
	modo_card      ENUM('portrait','landscape') NOT NULL DEFAULT 'portrait',
	criado_em      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
	atualizado_em  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Dias em que a loja fecha (feriados, folgas pontuais)
DROP TABLE IF EXISTS loja_dias_fechados;
CREATE TABLE loja_dias_fechados (
	id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	loja_id  INT UNSIGNED NOT NULL,
	data     DATE         NOT NULL,
	CONSTRAINT fk_dias_fechados_loja FOREIGN KEY (loja_id)
		REFERENCES lojas(id) ON DELETE CASCADE,
	UNIQUE KEY uq_loja_data (loja_id, data)
) ENGINE=InnoDB;

-- Filtros personalizados da loja (ex: "Bebidas", "Combo")
DROP TABLE IF EXISTS loja_filtros;
CREATE TABLE loja_filtros (
	id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	loja_id  INT UNSIGNED NOT NULL,
	nome     VARCHAR(60)  NOT NULL,
	valor    VARCHAR(60)  NOT NULL,
	CONSTRAINT fk_filtros_loja FOREIGN KEY (loja_id)
		REFERENCES lojas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Itens vinculados manualmente a um filtro (manualItems em gerenciamento.js)
DROP TABLE IF EXISTS loja_filtro_itens;
CREATE TABLE loja_filtro_itens (
	id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	filtro_id  INT UNSIGNED NOT NULL,
	item_nome  VARCHAR(120) NOT NULL,
	CONSTRAINT fk_filtro_itens_filtro FOREIGN KEY (filtro_id)
		REFERENCES loja_filtros(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ITENS (produtos e serviços — vitrine, bazar e catálogo de lojas)
-- Todo item pertence a EXATAMENTE um dono: uma loja (loja_id) OU
-- uma conta de usuário (usuario_id) — nunca os dois, nunca nenhum.
-- Ex: vitrine "nova" e serviços de loja usam loja_id; bazar (usado)
-- e prestadores autônomos usam usuario_id.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS itens;
CREATE TABLE itens (
	id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	loja_id      INT UNSIGNED NULL,
	usuario_id   INT UNSIGNED NULL,
	tipo         ENUM('produto','servico') NOT NULL DEFAULT 'produto',
	nome         VARCHAR(160)  NOT NULL,
	descricao    TEXT          NULL,
	preco        DECIMAL(10,2) NOT NULL DEFAULT 0,
	preco_antigo DECIMAL(10,2) NULL,       -- desconto (vitrine) ou preço de novo (bazar)
	foto_url     VARCHAR(255)  NULL,
	video_url    VARCHAR(255)  NULL,
	categoria    VARCHAR(80)   NULL,
	subcategoria VARCHAR(80)   NULL,
	marca        VARCHAR(80)   NULL,
	quantidade   INT           NULL,
	duracao_min  INT UNSIGNED  NULL,       -- duração estimada do atendimento (serviços com agenda)
	cor          VARCHAR(40)   NULL,
	voltagem     VARCHAR(20)   NULL,
	entrega      TINYINT(1)    NOT NULL DEFAULT 1,
	retirada     TINYINT(1)    NOT NULL DEFAULT 1,
	avaliacao    DECIMAL(2,1)  NULL,
	avaliacoes   INT UNSIGNED  NULL,
	badge        VARCHAR(30)   NULL,        -- ex: 'Novo', 'Top', 'Oferta' (vitrine)
	condicao     ENUM('otimo','bom','regular') NULL, -- só bazar (usado)
	bairro       VARCHAR(80)   NULL,        -- localização do vendedor (bazar)
	criado_em    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_itens_loja FOREIGN KEY (loja_id)
		REFERENCES lojas(id) ON DELETE CASCADE,
	CONSTRAINT fk_itens_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE,
	CONSTRAINT chk_itens_um_dono CHECK (
		(loja_id IS NOT NULL AND usuario_id IS NULL) OR
		(loja_id IS NULL AND usuario_id IS NOT NULL)
	)
) ENGINE=InnoDB;

-- Galeria de fotos por item (foto_url acima continua sendo a capa;
-- a primeira foto daqui é sempre espelhada para lá)
DROP TABLE IF EXISTS item_fotos;
CREATE TABLE item_fotos (
	id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	item_id  INT UNSIGNED NOT NULL,
	url      VARCHAR(255) NOT NULL,
	ordem    INT UNSIGNED NOT NULL DEFAULT 0,
	CONSTRAINT fk_item_fotos_item FOREIGN KEY (item_id)
		REFERENCES itens(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Variações do item (ex: Tamanho P/M/G, Cor Azul/Preto), cada uma
-- com estoque próprio e preço opcional (sobrescreve itens.preco)
DROP TABLE IF EXISTS item_variacoes;
CREATE TABLE item_variacoes (
	id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	item_id  INT UNSIGNED NOT NULL,
	tipo     VARCHAR(30)   NOT NULL DEFAULT 'Variação',
	valor    VARCHAR(60)   NOT NULL,
	estoque  INT UNSIGNED  NOT NULL DEFAULT 0,
	preco    DECIMAL(10,2) NULL,
	CONSTRAINT fk_item_variacoes_item FOREIGN KEY (item_id)
		REFERENCES itens(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ENTREGADORES (perfil de quem faz entregas — ver HTML/entregador.html)
-- Um perfil por usuário, como perfis_profissionais. `disponivel` é o
-- "ficar online" do app; lat/lng é a última posição conhecida,
-- atualizada por polling enquanto o entregador está online.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS entregadores;
CREATE TABLE entregadores (
	id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id    INT UNSIGNED NOT NULL UNIQUE,
	veiculo       ENUM('moto','bike','carro','a_pe') NOT NULL DEFAULT 'moto',
	placa         VARCHAR(10)  NULL,
	disponivel    TINYINT(1)   NOT NULL DEFAULT 0,
	lat           DECIMAL(10,7) NULL,
	lng           DECIMAL(10,7) NULL,
	atualizado_em DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	criado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_entregadores_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- PEDIDOS (compras de produto ou contratação de serviço)
-- status é a mesma máquina de estados usada nos dois lados:
--   painel do lojista (gerenciamento.js)  -> avança a etapa
--   Minha Conta do cliente (conta.js)     -> lê o mesmo status
-- entregador_id + endereco_id ligam o pedido ao painel do
-- entregador (HTML/entregador.html) quando o item exige entrega;
-- 'preparando' + entregador_id = indo retirar na loja,
-- 'a_caminho' = indo até o cliente (reaproveita o valor já existente).
-- ---------------------------------------------------------
DROP TABLE IF EXISTS pedidos;
CREATE TABLE pedidos (
	id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id       INT UNSIGNED NOT NULL,
	loja_id          INT UNSIGNED NULL, -- NULL quando o item é da vitrine geral, sem loja própria
	entregador_id    INT UNSIGNED NULL, -- quem aceitou a entrega (ver tabela entregadores)
	endereco_id      INT UNSIGNED NULL, -- destino da entrega (ver tabela enderecos)
	item_id          INT UNSIGNED NOT NULL,
	tipo             ENUM('produto','servico') NOT NULL,
	status           ENUM(
		'aguardando_pagamento',
		'preparando',
		'a_caminho',
		'a_avaliar',
		'concluido'
	) NOT NULL DEFAULT 'aguardando_pagamento',
	valor            DECIMAL(10,2) NOT NULL,
	codigo_rastreio  VARCHAR(40)   NULL,
	criado_em        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
	atualizado_em    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE,
	CONSTRAINT fk_pedidos_loja FOREIGN KEY (loja_id)
		REFERENCES lojas(id) ON DELETE CASCADE,
	CONSTRAINT fk_pedidos_item FOREIGN KEY (item_id)
		REFERENCES itens(id) ON DELETE RESTRICT,
	CONSTRAINT fk_pedidos_entregador FOREIGN KEY (entregador_id)
		REFERENCES entregadores(id) ON DELETE SET NULL,
	CONSTRAINT fk_pedidos_endereco FOREIGN KEY (endereco_id)
		REFERENCES enderecos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Histórico de mudança de status (auditoria simples da esteira de etapas)
DROP TABLE IF EXISTS pedido_status_historico;
CREATE TABLE pedido_status_historico (
	id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	pedido_id  INT UNSIGNED NOT NULL,
	status     VARCHAR(30)  NOT NULL,
	criado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_status_historico_pedido FOREIGN KEY (pedido_id)
		REFERENCES pedidos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Avaliação do cliente após "A avaliar" (ver conta.js: enviarAvaliacao)
DROP TABLE IF EXISTS avaliacoes;
CREATE TABLE avaliacoes (
	id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	pedido_id   INT UNSIGNED NOT NULL UNIQUE,
	usuario_id  INT UNSIGNED NOT NULL,
	nota        TINYINT UNSIGNED NOT NULL, -- 1 a 5
	comentario  TEXT NULL,
	criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_avaliacoes_pedido FOREIGN KEY (pedido_id)
		REFERENCES pedidos(id) ON DELETE CASCADE,
	CONSTRAINT fk_avaliacoes_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE,
	CONSTRAINT chk_avaliacoes_nota CHECK (nota BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- MENSAGENS (interações e dúvidas de clientes sobre itens —
-- ver o balão flutuante em gerenciamento.js/gerenciamento.html)
-- tipo 'compra'    = cliente que já comprou/contratou
-- tipo 'interacao' = pergunta/comentário geral
-- ---------------------------------------------------------
DROP TABLE IF EXISTS mensagens;
CREATE TABLE mensagens (
	id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	loja_id    INT UNSIGNED NOT NULL,
	usuario_id INT UNSIGNED NOT NULL,
	item_id    INT UNSIGNED NULL,
	tipo       ENUM('compra','interacao') NOT NULL DEFAULT 'interacao',
	texto      TEXT         NOT NULL,
	lida       TINYINT(1)   NOT NULL DEFAULT 0,
	criado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_mensagens_loja FOREIGN KEY (loja_id)
		REFERENCES lojas(id) ON DELETE CASCADE,
	CONSTRAINT fk_mensagens_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE,
	CONSTRAINT fk_mensagens_item FOREIGN KEY (item_id)
		REFERENCES itens(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Respostas do lojista (uma mensagem pode ter várias, estilo chat)
DROP TABLE IF EXISTS mensagem_respostas;
CREATE TABLE mensagem_respostas (
	id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	mensagem_id  INT UNSIGNED NOT NULL,
	texto        TEXT NULL,
	criado_em    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_respostas_mensagem FOREIGN KEY (mensagem_id)
		REFERENCES mensagens(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Anexos (foto/vídeo/documento) de uma mensagem ORIGINAL do cliente
-- ou de uma RESPOSTA do lojista — nunca das duas ao mesmo tempo.
DROP TABLE IF EXISTS mensagem_anexos;
CREATE TABLE mensagem_anexos (
	id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	mensagem_id          INT UNSIGNED NULL,
	mensagem_resposta_id INT UNSIGNED NULL,
	tipo                 ENUM('foto','video','documento') NOT NULL,
	nome_arquivo         VARCHAR(200) NOT NULL,
	url                  VARCHAR(255) NULL,
	criado_em            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_anexos_mensagem FOREIGN KEY (mensagem_id)
		REFERENCES mensagens(id) ON DELETE CASCADE,
	CONSTRAINT fk_anexos_resposta FOREIGN KEY (mensagem_resposta_id)
		REFERENCES mensagem_respostas(id) ON DELETE CASCADE,
	CONSTRAINT chk_anexos_um_dono CHECK (
		(mensagem_id IS NOT NULL AND mensagem_resposta_id IS NULL) OR
		(mensagem_id IS NULL AND mensagem_resposta_id IS NOT NULL)
	)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- LOJA DE APLICATIVOS (ver JS/data/apps-catalogo.js)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS apps_catalogo;
CREATE TABLE apps_catalogo (
	id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	nome        VARCHAR(120) NOT NULL,
	loja_id     INT UNSIGNED NULL,       -- NULL para apps do próprio sistema (ex: Painel do Lojista)
	descricao   VARCHAR(255) NULL,
	icone_classe VARCHAR(60) NOT NULL,   -- classe Font Awesome, ex: 'fas fa-store'
	cor         CHAR(7)      NOT NULL DEFAULT '#2e7d32',
	categoria   VARCHAR(40)  NOT NULL,   -- mercado, bazar, servicos, beleza, moda, lojista, ...
	url         VARCHAR(255) NOT NULL,
	destaque    TINYINT(1)   NOT NULL DEFAULT 0,
	selo        VARCHAR(40)  NULL,       -- ex: 'Novo', '24h', 'Mais usado', 'Seu app'
	CONSTRAINT fk_apps_loja FOREIGN KEY (loja_id)
		REFERENCES lojas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Atalhos fixados pelo usuário (painel "Meus Apps")
DROP TABLE IF EXISTS atalhos_usuario;
CREATE TABLE atalhos_usuario (
	id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id INT UNSIGNED NOT NULL,
	app_id     INT UNSIGNED NOT NULL,
	criado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_atalhos_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE,
	CONSTRAINT fk_atalhos_app FOREIGN KEY (app_id)
		REFERENCES apps_catalogo(id) ON DELETE CASCADE,
	UNIQUE KEY uq_usuario_app (usuario_id, app_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- CÓDIGOS DE VERIFICAÇÃO (recuperação de senha por e-mail)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS codigos_verificacao;
CREATE TABLE codigos_verificacao (
	id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id INT UNSIGNED NOT NULL,
	codigo     CHAR(6)      NOT NULL,
	tipo       ENUM('recuperacao_senha', 'confirmacao_cadastro') NOT NULL DEFAULT 'recuperacao_senha',
	expira_em  DATETIME     NOT NULL,
	usado      TINYINT(1)   NOT NULL DEFAULT 0,
	criado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_codigos_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- PERFIS DE PROFISSIONAIS (prestadores de serviço autônomos —
-- ver HTML/servicos.html). Um perfil por usuário.
-- ---------------------------------------------------------
DROP TABLE IF EXISTS perfil_profissional_tags;
DROP TABLE IF EXISTS perfis_profissionais;
CREATE TABLE perfis_profissionais (
	id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id    INT UNSIGNED NOT NULL UNIQUE,
	especialidade VARCHAR(30)   NOT NULL, -- construcao, eletrica, hidraulica, limpeza, tecnologia, beleza, outros
	ocupacao      VARCHAR(120)  NOT NULL,
	descricao     TEXT          NULL,
	avaliacao     DECIMAL(2,1)  NULL,
	avaliacoes    INT UNSIGNED  NOT NULL DEFAULT 0,
	verificado    TINYINT(1)    NOT NULL DEFAULT 0,
	disponivel    TINYINT(1)    NOT NULL DEFAULT 1,
	bairro        VARCHAR(80)   NULL,
	atende        VARCHAR(120)  NULL,
	horario       VARCHAR(120)  NULL,
	preco         DECIMAL(10,2) NULL,
	unidade       VARCHAR(20)   NULL,     -- ex: 'hora', 'diária', 'serviço'
	telefone      VARCHAR(20)   NULL,
	criado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_perfil_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tags de especialidade do profissional (ex: 'Pedreiro', 'Reforma')
CREATE TABLE perfil_profissional_tags (
	id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	perfil_id INT UNSIGNED NOT NULL,
	tag       VARCHAR(40)  NOT NULL,
	CONSTRAINT fk_perfil_tags_perfil FOREIGN KEY (perfil_id)
		REFERENCES perfis_profissionais(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- VAGAS DE EMPREGO (ver HTML/servicos.html)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS vagas_emprego;
CREATE TABLE vagas_emprego (
	id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id INT UNSIGNED NOT NULL, -- conta que publicou a vaga
	cargo      VARCHAR(120) NOT NULL,
	empresa    VARCHAR(120) NOT NULL,
	area       VARCHAR(30)  NULL,
	regime     VARCHAR(30)  NULL,     -- CLT, Autônomo, Freelancer, Temporário...
	salario    VARCHAR(40)  NULL,     -- texto livre: 'R$ 1.518', 'A combinar'...
	local      VARCHAR(120) NULL,
	descricao  TEXT         NULL,
	contato    VARCHAR(20)  NULL,
	criado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_vagas_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
