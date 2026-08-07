-- =========================================================
-- MIGRAÇÃO: produto avançado (múltiplas fotos + variações)
-- Rodar UMA VEZ no banco já existente da VPS (mega_distrito).
-- Apenas cria tabelas novas — não altera nem apaga nenhum dado
-- já cadastrado em `itens`. `preco_antigo` (preço "de") já existe
-- desde migration_anuncios.sql e é reaproveitado como preço
-- promocional; `foto_url` continua sendo a foto de capa (a
-- primeira de item_fotos é sempre espelhada para lá).
-- =========================================================

USE mega_distrito;

-- ---------------------------------------------------------
-- 1) Galeria de fotos por item (foto_url em `itens` continua
--    sendo a capa/thumbnail usada nos cards da vitrine)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS item_fotos;
CREATE TABLE item_fotos (
	id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	item_id  INT UNSIGNED NOT NULL,
	url      VARCHAR(255) NOT NULL,
	ordem    INT UNSIGNED NOT NULL DEFAULT 0,
	CONSTRAINT fk_item_fotos_item FOREIGN KEY (item_id)
		REFERENCES itens(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 2) Variações do item (ex: Tamanho P/M/G, Cor Azul/Preto),
--    cada uma com estoque próprio e preço opcional (sobrescreve
--    `itens.preco` quando o cliente escolhe aquela variação).
-- ---------------------------------------------------------
DROP TABLE IF EXISTS item_variacoes;
CREATE TABLE item_variacoes (
	id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	item_id  INT UNSIGNED NOT NULL,
	tipo     VARCHAR(30)   NOT NULL DEFAULT 'Variação', -- ex: 'Tamanho', 'Cor'
	valor    VARCHAR(60)   NOT NULL,                     -- ex: 'P', 'Azul'
	estoque  INT UNSIGNED  NOT NULL DEFAULT 0,
	preco    DECIMAL(10,2) NULL,                         -- opcional; NULL = usa itens.preco
	CONSTRAINT fk_item_variacoes_item FOREIGN KEY (item_id)
		REFERENCES itens(id) ON DELETE CASCADE
) ENGINE=InnoDB;
