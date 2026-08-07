-- =========================================================
-- MIGRAÇÃO: anúncios estruturados (loja OU conta de usuário)
-- Rodar UMA VEZ no banco já existente da VPS (mega_distrito).
-- Não apaga nenhum dado real já cadastrado (usuários, pedidos,
-- mensagens, atalhos). Usa LAST_INSERT_ID() em vez de ids fixos
-- porque o banco de produção já tem contas reais criadas.
-- =========================================================

USE mega_distrito;

-- ---------------------------------------------------------
-- 1) Novas colunas em `itens`
-- ---------------------------------------------------------
ALTER TABLE itens
	ADD COLUMN usuario_id INT UNSIGNED NULL AFTER loja_id,
	ADD COLUMN avaliacao  DECIMAL(2,1) NULL,
	ADD COLUMN avaliacoes INT UNSIGNED NULL,
	ADD COLUMN badge      VARCHAR(30) NULL,
	ADD COLUMN condicao   ENUM('otimo','bom','regular') NULL,
	ADD COLUMN bairro     VARCHAR(80) NULL;

ALTER TABLE itens
	ADD CONSTRAINT fk_itens_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE;

-- ---------------------------------------------------------
-- 2) Loja de Exemplo (dona da vitrine geral, que hoje não
--    pertence a nenhum lojista real)
-- ---------------------------------------------------------
INSERT INTO lojas (slug, nome, categoria, subtitulo, cor_primaria, cor_destaque, horario_abre, horario_fecha)
VALUES ('loja-exemplo', 'Loja de Exemplo', 'Vitrine Geral', 'Produtos de demonstração da vitrine principal', '#455a64', '#607d8b', '00:00:00', '23:59:00');
SET @loja_exemplo := LAST_INSERT_ID();

-- Corrige itens órfãos que já existiam (sem loja nem usuário)
UPDATE itens SET loja_id = @loja_exemplo WHERE loja_id IS NULL AND usuario_id IS NULL;

-- ---------------------------------------------------------
-- 3) Agora sim: toda linha de `itens` tem exatamente um dono
-- ---------------------------------------------------------
ALTER TABLE itens
	ADD CONSTRAINT chk_itens_um_dono CHECK (
		(loja_id IS NOT NULL AND usuario_id IS NULL) OR
		(loja_id IS NULL AND usuario_id IS NOT NULL)
	);

-- ---------------------------------------------------------
-- 4) Restante da vitrine "nova" (os 3 itens que já existiam —
--    Notebook/Fone/Kit Ferramentas — foram corrigidos acima;
--    aqui entram os outros 9 produtos do catálogo original)
-- ---------------------------------------------------------
INSERT INTO itens (loja_id, tipo, nome, preco, preco_antigo, categoria, avaliacao, avaliacoes, badge) VALUES
	(@loja_exemplo, 'produto', 'Smartphone Galaxy A55',      1299.90, 1599.90, 'eletronicos', 4.5, 128, 'Novo'),
	(@loja_exemplo, 'produto', 'Fone Bluetooth Premium',      199.90,  249.90, 'eletronicos', 4.8, 256, 'Top'),
	(@loja_exemplo, 'produto', 'Panela de Pressão 7 L',       129.90, NULL,    'casa',        4.4, 312, NULL),
	(@loja_exemplo, 'produto', 'Kit Organizador Doméstico',    89.90,  119.90, 'casa',        4.2, 174, 'Promoção'),
	(@loja_exemplo, 'produto', 'Ventilador de Mesa 40 cm',    159.90, NULL,    'casa',        4.0,  95, NULL),
	(@loja_exemplo, 'produto', 'Furadeira de Impacto 750 W',  349.90,  429.90, 'ferramentas', 4.7, 203, 'Top'),
	(@loja_exemplo, 'produto', 'Serra Circular 7¼"',          499.90,  599.90, 'ferramentas', 4.6,  68, 'Oferta'),
	(@loja_exemplo, 'produto', 'Camiseta Básica Premium',      59.90,   79.90, 'moda',        4.3, 421, NULL),
	(@loja_exemplo, 'produto', 'Tênis Esportivo Runner',      289.90,  399.90, 'moda',        4.9, 567, 'Destaque'),
	(@loja_exemplo, 'produto', 'Jaqueta Corta-Vento',         179.90,  229.90, 'moda',        4.4, 189, 'Promoção');

-- Também corrige o badge dos 3 itens órfãos originais para bater com o catálogo:
UPDATE itens SET avaliacao=4.6, avaliacoes=89,  badge='Oferta', preco_antigo=3499.90 WHERE nome = 'Notebook Ultrafino i5' AND loja_id = @loja_exemplo;
UPDATE itens SET avaliacao=4.6, avaliacoes=128, badge=NULL                          WHERE nome = 'Fone Bluetooth X200'   AND loja_id = @loja_exemplo;
UPDATE itens SET avaliacao=4.5, avaliacoes=147, badge=NULL                          WHERE nome = 'Kit Ferramentas'       AND loja_id = @loja_exemplo;

-- ---------------------------------------------------------
-- 5) Bazar/usados — cada item pertence à conta do próprio
--    vendedor (usuario_id). Cria uma conta demo por vendedor.
-- ---------------------------------------------------------
INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Rafael M.', 'demo.rafael.m@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @v := LAST_INSERT_ID();
INSERT INTO itens (usuario_id, tipo, nome, descricao, preco, preco_antigo, categoria, condicao, bairro) VALUES
	(@v, 'produto', 'Smartphone Samsung S21 (256 GB)', 'Sem arranhões, bateria 92%. Acompanha carregador e caixa original.', 1200.00, 3500.00, 'eletronicos', 'otimo', 'Centro, Magé');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Ana Paula S.', 'demo.anapaula.s@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @v := LAST_INSERT_ID();
INSERT INTO itens (usuario_id, tipo, nome, descricao, preco, preco_antigo, categoria, condicao, bairro) VALUES
	(@v, 'produto', 'Notebook Dell Inspiron 15"', 'Intel i5 10ª geração, 8 GB RAM, SSD 256 GB. Pequeno risco na tampa.', 1350.00, 3200.00, 'eletronicos', 'bom', 'Suruí, Magé');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Lucas F.', 'demo.lucas.f@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @v := LAST_INSERT_ID();
INSERT INTO itens (usuario_id, tipo, nome, descricao, preco, preco_antigo, categoria, condicao, bairro) VALUES
	(@v, 'produto', 'Fone JBL Tune 510BT', 'Funcionando perfeitamente, uso de 4 meses. Sem caixa.', 89.00, 199.00, 'eletronicos', 'bom', 'Fragoso, Magé');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Cláudia R.', 'demo.claudia.r@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @v := LAST_INSERT_ID();
INSERT INTO itens (usuario_id, tipo, nome, descricao, preco, preco_antigo, categoria, condicao, bairro) VALUES
	(@v, 'produto', 'Jogo de Panelas Tramontina (7 peças)', 'Jogo completo antiaderente, leve desgaste no exterior. Ótimo para uso diário.', 120.00, 350.00, 'casa', 'bom', 'Santo Aleixo, Magé');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Jorge P.', 'demo.jorge.p@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @v := LAST_INSERT_ID();
INSERT INTO itens (usuario_id, tipo, nome, descricao, preco, preco_antigo, categoria, condicao, bairro) VALUES
	(@v, 'produto', 'Ar-Condicionado Split 12.000 BTU', 'Higienizado recentemente. Gelando muito bem, com controle remoto.', 800.00, 2500.00, 'casa', 'otimo', 'Barbuda, Magé');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Fernanda L.', 'demo.fernanda.l@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @v := LAST_INSERT_ID();
INSERT INTO itens (usuario_id, tipo, nome, descricao, preco, preco_antigo, categoria, condicao, bairro) VALUES
	(@v, 'produto', 'Mesa de Jantar 6 Cadeiras', 'Madeira maciça, precisa de envernizamento. Estrutura firme, cadeiras sem avaria.', 380.00, 1200.00, 'casa', 'regular', 'Mauá, Magé');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Carlos A.', 'demo.carlos.a@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @v := LAST_INSERT_ID();
INSERT INTO itens (usuario_id, tipo, nome, descricao, preco, preco_antigo, categoria, condicao, bairro) VALUES
	(@v, 'produto', 'Furadeira Bosch 500W', 'Pouco uso, guardada há 2 anos. Acompanha maleta e acessórios originais.', 180.00, 480.00, 'ferramentas', 'otimo', 'Piabetá, Magé');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Marcos T.', 'demo.marcos.t@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @v := LAST_INSERT_ID();
INSERT INTO itens (usuario_id, tipo, nome, descricao, preco, preco_antigo, categoria, condicao, bairro) VALUES
	(@v, 'produto', 'Conjunto de Chaves (40 peças)', 'Chaves allen, fendas e philips. Caixa plástica com pequena trinca na tampa.', 55.00, 150.00, 'ferramentas', 'bom', 'Inhomirim, Magé');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Beatriz O.', 'demo.beatriz.o@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @v := LAST_INSERT_ID();
INSERT INTO itens (usuario_id, tipo, nome, descricao, preco, preco_antigo, categoria, condicao, bairro) VALUES
	(@v, 'produto', 'Tênis Nike Air Max 42', 'Usado 3 vezes apenas. Sem defeitos, sola perfeita. Acompanha caixa.', 250.00, 850.00, 'moda', 'otimo', 'Centro, Magé');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Talita B.', 'demo.talita.b@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @v := LAST_INSERT_ID();
INSERT INTO itens (usuario_id, tipo, nome, descricao, preco, preco_antigo, categoria, condicao, bairro) VALUES
	(@v, 'produto', 'Jaqueta Couro Sintético G', 'Pouco uso, apenas pequeno desgaste na gola. Cor preta, tamanho G.', 95.00, 249.00, 'moda', 'bom', 'Raiz da Serra, Magé');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Patrícia G.', 'demo.patriciag@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @v := LAST_INSERT_ID();
INSERT INTO itens (usuario_id, tipo, nome, descricao, preco, preco_antigo, categoria, condicao, bairro) VALUES
	(@v, 'produto', 'Bicicleta Infantil Aro 20', 'Guidão e selim ajustáveis, pneus bons, com rodinhas. Cor azul.', 150.00, 450.00, 'outros', 'bom', 'Cachoeiras, Magé');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Eduardo N.', 'demo.eduardo.n@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @v := LAST_INSERT_ID();
INSERT INTO itens (usuario_id, tipo, nome, descricao, preco, preco_antigo, categoria, condicao, bairro) VALUES
	(@v, 'produto', 'Estante de Livros 5 Prateleiras', 'MDF, algumas marcas de uso. Fácil desmontagem, retirar no local.', 80.00, 299.00, 'outros', 'regular', 'Magé Centro');

-- ---------------------------------------------------------
-- 6) Novas tabelas: perfis de profissionais + tags
-- ---------------------------------------------------------
CREATE TABLE perfis_profissionais (
	id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id    INT UNSIGNED NOT NULL UNIQUE,
	especialidade VARCHAR(30)   NOT NULL,
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
	unidade       VARCHAR(20)   NULL,
	telefone      VARCHAR(20)   NULL,
	criado_em     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_perfil_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE perfil_profissional_tags (
	id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	perfil_id INT UNSIGNED NOT NULL,
	tag       VARCHAR(40)  NOT NULL,
	CONSTRAINT fk_perfil_tags_perfil FOREIGN KEY (perfil_id)
		REFERENCES perfis_profissionais(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 7) Vagas de emprego
-- ---------------------------------------------------------
CREATE TABLE vagas_emprego (
	id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id INT UNSIGNED NOT NULL,
	cargo      VARCHAR(120) NOT NULL,
	empresa    VARCHAR(120) NOT NULL,
	area       VARCHAR(30)  NULL,
	regime     VARCHAR(30)  NULL,
	salario    VARCHAR(40)  NULL,
	local      VARCHAR(120) NULL,
	descricao  TEXT         NULL,
	contato    VARCHAR(20)  NULL,
	criado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_vagas_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 8) Contas + perfis dos profissionais (JS/data/profissionais.js)
-- ---------------------------------------------------------
INSERT INTO usuarios (nome, email, senha_hash, telefone, email_verificado) VALUES ('João Carlos Silva', 'demo.joaocarlos@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', '21999990001', 1);
SET @p := LAST_INSERT_ID();
INSERT INTO perfis_profissionais (usuario_id, especialidade, ocupacao, descricao, avaliacao, avaliacoes, verificado, disponivel, bairro, atende, horario, preco, unidade, telefone) VALUES
	(@p, 'construcao', 'Pedreiro & Azulejista', 'Especialista em alvenaria, assentamento de pisos, revestimentos e pequenas reformas residenciais.', 4.8, 74, 1, 1, 'Centro, Magé', 'Magé e região', 'Seg—Sáb: 07h—17h', 200, 'diária', '21999990001');
SET @perfil := LAST_INSERT_ID();
INSERT INTO perfil_profissional_tags (perfil_id, tag) VALUES (@perfil,'Pedreiro'),(@perfil,'Azulejista'),(@perfil,'Reforma'),(@perfil,'Pinturas');

INSERT INTO usuarios (nome, email, senha_hash, telefone, email_verificado) VALUES ('Marcos Andrade', 'demo.marcosandrade@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', '21999990002', 1);
SET @p := LAST_INSERT_ID();
INSERT INTO perfis_profissionais (usuario_id, especialidade, ocupacao, descricao, avaliacao, avaliacoes, verificado, disponivel, bairro, atende, horario, preco, unidade, telefone) VALUES
	(@p, 'eletrica', 'Eletricista Residencial', 'Instalações elétricas residenciais e comerciais, quadros de distribuição, SPDA e tomadas.', 5.0, 112, 1, 1, 'Piabetá, Magé', 'Magé e Guapimirim', 'Seg—Sex: 08h—18h | Sáb: 08h—12h', 120, 'hora', '21999990002');
SET @perfil := LAST_INSERT_ID();
INSERT INTO perfil_profissional_tags (perfil_id, tag) VALUES (@perfil,'Elétrica'),(@perfil,'Instalações'),(@perfil,'SPDA'),(@perfil,'Iluminação');

INSERT INTO usuarios (nome, email, senha_hash, telefone, email_verificado) VALUES ('Roberto Fonseca', 'demo.robertofonseca@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', '21999990003', 1);
SET @p := LAST_INSERT_ID();
INSERT INTO perfis_profissionais (usuario_id, especialidade, ocupacao, descricao, avaliacao, avaliacoes, verificado, disponivel, bairro, atende, horario, preco, unidade, telefone) VALUES
	(@p, 'hidraulica', 'Encanador & Hidráulico', 'Conserto de vazamentos, instalação de boxes, torneiras, chuveiros e caixas d''água.', 4.7, 89, 1, 0, 'Mauá, Magé', 'Magé e região', 'Seg—Sex: 07h—17h', 150, 'hora', '21999990003');
SET @perfil := LAST_INSERT_ID();
INSERT INTO perfil_profissional_tags (perfil_id, tag) VALUES (@perfil,'Encanamento'),(@perfil,'Infiltração'),(@perfil,'Caixa D''água'),(@perfil,'Box');

INSERT INTO usuarios (nome, email, senha_hash, telefone, email_verificado) VALUES ('Sandra Oliveira', 'demo.sandraoliveira@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', '21999990004', 1);
SET @p := LAST_INSERT_ID();
INSERT INTO perfis_profissionais (usuario_id, especialidade, ocupacao, descricao, avaliacao, avaliacoes, verificado, disponivel, bairro, atende, horario, preco, unidade, telefone) VALUES
	(@p, 'limpeza', 'Diarista & Faxineira', 'Limpeza residencial completa, pós-obra, escritórios e eventos. Produto de qualidade incluso.', 4.9, 203, 1, 1, 'Centro, Magé', 'Magé e região', 'Seg—Sáb: 08h—17h', 180, 'diária', '21999990004');
SET @perfil := LAST_INSERT_ID();
INSERT INTO perfil_profissional_tags (perfil_id, tag) VALUES (@perfil,'Limpeza'),(@perfil,'Faxina'),(@perfil,'Pós-obra'),(@perfil,'Escritório');

INSERT INTO usuarios (nome, email, senha_hash, telefone, email_verificado) VALUES ('Felipe Rocha', 'demo.feliperocha@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', '21999990005', 1);
SET @p := LAST_INSERT_ID();
INSERT INTO perfis_profissionais (usuario_id, especialidade, ocupacao, descricao, avaliacao, avaliacoes, verificado, disponivel, bairro, atende, horario, preco, unidade, telefone) VALUES
	(@p, 'tecnologia', 'Técnico de Informática', 'Formatação, montagem de PCs, redes Wi-Fi, CFTV, instalação de programas e suporte remoto.', 4.6, 58, 0, 1, 'Piedade, Magé', 'Magé e região', 'Seg—Sex: 09h—19h | Sáb: 09h—14h', 80, 'hora', '21999990005');
SET @perfil := LAST_INSERT_ID();
INSERT INTO perfil_profissional_tags (perfil_id, tag) VALUES (@perfil,'Informática'),(@perfil,'Redes'),(@perfil,'CFTV'),(@perfil,'Formatação');

INSERT INTO usuarios (nome, email, senha_hash, telefone, email_verificado) VALUES ('Camila Ferreira', 'demo.camilaferreira@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', '21999990006', 1);
SET @p := LAST_INSERT_ID();
INSERT INTO perfis_profissionais (usuario_id, especialidade, ocupacao, descricao, avaliacao, avaliacoes, verificado, disponivel, bairro, atende, horario, preco, unidade, telefone) VALUES
	(@p, 'beleza', 'Manicure & Cabeleireira', 'Atendimento em domicílio. Manicure, pedicure, escova, coloração e alongamento de unhas.', 4.9, 347, 1, 1, 'Fragoso, Magé', 'Magé e região', 'Seg—Sáb: 09h—20h', 60, 'serviço', '21999990006');
SET @perfil := LAST_INSERT_ID();
INSERT INTO perfil_profissional_tags (perfil_id, tag) VALUES (@perfil,'Manicure'),(@perfil,'Pedicure'),(@perfil,'Cabelo'),(@perfil,'Alongamento');

INSERT INTO usuarios (nome, email, senha_hash, telefone, email_verificado) VALUES ('Antônio Pereira', 'demo.antoniopereira@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', '21999990007', 1);
SET @p := LAST_INSERT_ID();
INSERT INTO perfis_profissionais (usuario_id, especialidade, ocupacao, descricao, avaliacao, avaliacoes, verificado, disponivel, bairro, atende, horario, preco, unidade, telefone) VALUES
	(@p, 'construcao', 'Pintor Predial & Residencial', 'Pintura interna, externa, textura, grafiato e epóxi para pisos. Acabamento impecável.', 4.5, 61, 0, 1, 'Santo Aleixo, Magé', 'Magé e região', 'Seg—Sáb: 07h—17h', 180, 'diária', '21999990007');
SET @perfil := LAST_INSERT_ID();
INSERT INTO perfil_profissional_tags (perfil_id, tag) VALUES (@perfil,'Pintura'),(@perfil,'Textura'),(@perfil,'Grafiato'),(@perfil,'Epóxi');

INSERT INTO usuarios (nome, email, senha_hash, telefone, email_verificado) VALUES ('Tiago Souza', 'demo.tiagosouza@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', '21999990008', 1);
SET @p := LAST_INSERT_ID();
INSERT INTO perfis_profissionais (usuario_id, especialidade, ocupacao, descricao, avaliacao, avaliacoes, verificado, disponivel, bairro, atende, horario, preco, unidade, telefone) VALUES
	(@p, 'construcao', 'Marceneiro & Instalador', 'Montagem de móveis planejados, portas, janelas, decks e pequenos consertos em madeira.', 4.7, 44, 1, 0, 'Vila Inhomirim, Magé', 'Magé e região', 'Seg—Sex: 08h—17h', 120, 'hora', '21999990008');
SET @perfil := LAST_INSERT_ID();
INSERT INTO perfil_profissional_tags (perfil_id, tag) VALUES (@perfil,'Marcenaria'),(@perfil,'Móveis'),(@perfil,'Deck'),(@perfil,'Portas');

INSERT INTO usuarios (nome, email, senha_hash, telefone, email_verificado) VALUES ('Patrícia Gomes', 'demo.patriciagomes@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', '21999990009', 1);
SET @p := LAST_INSERT_ID();
INSERT INTO perfis_profissionais (usuario_id, especialidade, ocupacao, descricao, avaliacao, avaliacoes, verificado, disponivel, bairro, atende, horario, preco, unidade, telefone) VALUES
	(@p, 'outros', 'Cuidadora de Idosos', 'Cuidados diurnos e noturnos, acompanhamento médico, higiene pessoal e companhia.', 5.0, 29, 1, 1, 'Raiz da Serra, Magé', 'Magé e Guapimirim', 'Disponível 24h (combinar)', 220, 'diária', '21999990009');
SET @perfil := LAST_INSERT_ID();
INSERT INTO perfil_profissional_tags (perfil_id, tag) VALUES (@perfil,'Cuidadora'),(@perfil,'Idosos'),(@perfil,'Enfermagem'),(@perfil,'Diário/Noturno');

INSERT INTO usuarios (nome, email, senha_hash, telefone, email_verificado) VALUES ('Wesley Nascimento', 'demo.wesleyn@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', '21999990010', 1);
SET @p := LAST_INSERT_ID();
INSERT INTO perfis_profissionais (usuario_id, especialidade, ocupacao, descricao, avaliacao, avaliacoes, verificado, disponivel, bairro, atende, horario, preco, unidade, telefone) VALUES
	(@p, 'outros', 'Jardineiro & Paisagista', 'Corte de grama, poda de árvores, plantio, paisagismo e manutenção de jardins.', 4.4, 37, 0, 1, 'Suruí, Magé', 'Magé e região', 'Seg—Sáb: 07h—16h', 150, 'diária', '21999990010');
SET @perfil := LAST_INSERT_ID();
INSERT INTO perfil_profissional_tags (perfil_id, tag) VALUES (@perfil,'Jardinagem'),(@perfil,'Paisagismo'),(@perfil,'Poda'),(@perfil,'Manutenção');

-- ---------------------------------------------------------
-- 9) Contas + vagas de emprego (JS/data/vagas.js)
-- ---------------------------------------------------------
INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Mercado Central Magé', 'demo.mercadocentral@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @e := LAST_INSERT_ID();
INSERT INTO vagas_emprego (usuario_id, cargo, empresa, area, regime, salario, local, descricao, contato) VALUES
	(@e, 'Atendente de Loja', 'Mercado Central Magé', 'comercio', 'CLT', 'R$ 1.518', 'Centro, Magé', 'Atendimento ao cliente, organização de gôndolas e frente de caixa. Experiência desejável.', '21999990101');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Construtora Bramax', 'demo.bramax@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @e := LAST_INSERT_ID();
INSERT INTO vagas_emprego (usuario_id, cargo, empresa, area, regime, salario, local, descricao, contato) VALUES
	(@e, 'Auxiliar de Pedreiro', 'Construtora Bramax', 'construcao', 'CLT', 'R$ 1.700', 'Piabetá, Magé', 'Suporte em obras residenciais. Necessário ter experiência mínima de 6 meses.', '21999990102');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Prefeitura de Magé', 'demo.prefeitura@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @e := LAST_INSERT_ID();
INSERT INTO vagas_emprego (usuario_id, cargo, empresa, area, regime, salario, local, descricao, contato) VALUES
	(@e, 'Técnico de TI / Suporte', 'Prefeitura de Magé', 'tecnologia', 'Temporário', 'R$ 2.200', 'Centro, Magé', 'Suporte técnico em hardware e software para equipamentos da prefeitura. Necessário diploma técnico.', '21999990103');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Restaurante Sabor Real', 'demo.saborreal@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @e := LAST_INSERT_ID();
INSERT INTO vagas_emprego (usuario_id, cargo, empresa, area, regime, salario, local, descricao, contato) VALUES
	(@e, 'Cozinheira / Cozinheiro', 'Restaurante Sabor Real', 'servicos', 'CLT', 'A combinar', 'Suruí, Magé', 'Preparo de pratos executivos e a la carte. Experiência em cozinha industrial é diferencial.', '21999990104');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Clínica Saúde Magé', 'demo.clinicasaude@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @e := LAST_INSERT_ID();
INSERT INTO vagas_emprego (usuario_id, cargo, empresa, area, regime, salario, local, descricao, contato) VALUES
	(@e, 'Auxiliar de Enfermagem', 'Clínica Saúde Magé', 'saude', 'CLT', 'R$ 1.900', 'Centro, Magé', 'Assistência a pacientes, coleta de amostras e apoio em procedimentos clínicos.', '21999990105');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('DistribuiMagé Logística', 'demo.distribuimage@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @e := LAST_INSERT_ID();
INSERT INTO vagas_emprego (usuario_id, cargo, empresa, area, regime, salario, local, descricao, contato) VALUES
	(@e, 'Motorista Entregador', 'DistribuiMagé Logística', 'servicos', 'CLT', 'R$ 2.000 + comissão', 'Magé', 'Entrega de mercadorias em Magé e municípios vizinhos. CNH B obrigatória.', '21999990106');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Academia Fit Magé', 'demo.academiafit@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @e := LAST_INSERT_ID();
INSERT INTO vagas_emprego (usuario_id, cargo, empresa, area, regime, salario, local, descricao, contato) VALUES
	(@e, 'Recepcionista', 'Academia Fit Magé', 'servicos', 'CLT', 'R$ 1.518', 'Barbuda, Magé', 'Recepção de alunos, controle de acesso, agendamentos e suporte administrativo.', '21999990107');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Obras Piabetá', 'demo.obraspiabeta@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @e := LAST_INSERT_ID();
INSERT INTO vagas_emprego (usuario_id, cargo, empresa, area, regime, salario, local, descricao, contato) VALUES
	(@e, 'Eletricista Autônomo', 'Obras Piabetá', 'construcao', 'Autônomo', 'A combinar', 'Piabetá, Magé', 'Instalações elétricas em obra de médio porte. Disponibilidade imediata.', '21999990108');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Agência Digital Local', 'demo.agenciadigital@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @e := LAST_INSERT_ID();
INSERT INTO vagas_emprego (usuario_id, cargo, empresa, area, regime, salario, local, descricao, contato) VALUES
	(@e, 'Designer Gráfico Freelancer', 'Agência Digital Local', 'tecnologia', 'Freelancer', 'R$ 80–120/peça', 'Remoto / Magé', 'Criação de posts para redes sociais, flyers e identidade visual. Portfólio obrigatório.', '21999990109');

INSERT INTO usuarios (nome, email, senha_hash, email_verificado) VALUES ('Escola Estadual Magé', 'demo.escolaestadual@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', 1);
SET @e := LAST_INSERT_ID();
INSERT INTO vagas_emprego (usuario_id, cargo, empresa, area, regime, salario, local, descricao, contato) VALUES
	(@e, 'Auxiliar de Limpeza', 'Escola Estadual Magé', 'outros', 'CLT', 'R$ 1.518', 'Centro, Magé', 'Serviços de limpeza e conservação em ambiente escolar. Turnos manhã ou tarde.', '21999990110');
