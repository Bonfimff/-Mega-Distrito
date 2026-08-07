-- =========================================================
-- MIGRAÇÃO: app de entregas (painel do entregador)
-- Rodar UMA VEZ no banco já existente da VPS (mega_distrito).
-- Só adiciona colunas/tabelas novas — não altera nem apaga dado
-- existente. Sem mudança no ENUM de pedidos.status: reaproveita
-- 'preparando' (+ entregador_id) para "indo retirar na loja" e
-- 'a_caminho' (já existia) para "indo até o cliente".
-- =========================================================

USE mega_distrito;

-- ---------------------------------------------------------
-- 1) Coordenadas de retirada (loja) e de entrega (endereço do
--    cliente) — usadas pelo mapa do entregador e pelo cálculo
--    de distância. Preenchidas por geocodificação automática
--    (ver Python/geocoding.py) ou manualmente quando ausentes.
-- ---------------------------------------------------------
ALTER TABLE lojas
	ADD COLUMN lat DECIMAL(10,7) NULL AFTER endereco_url,
	ADD COLUMN lng DECIMAL(10,7) NULL AFTER lat;

ALTER TABLE enderecos
	ADD COLUMN lat DECIMAL(10,7) NULL AFTER cep,
	ADD COLUMN lng DECIMAL(10,7) NULL AFTER lat;

-- Coordenadas aproximadas das lojas seed (Magé-RJ), para o mapa
-- já ter dados reais em ambiente de teste/demo.
UPDATE lojas SET lat = -22.6660, lng = -43.0400 WHERE slug = 'loja-central' AND lat IS NULL;
UPDATE lojas SET lat = -22.6640, lng = -43.0370 WHERE slug = 'drogaria-central' AND lat IS NULL;

-- ---------------------------------------------------------
-- 2) ENTREGADORES (um perfil por usuário, como perfis_profissionais)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS entregadores;
CREATE TABLE entregadores (
	id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id    INT UNSIGNED NOT NULL UNIQUE,
	veiculo       ENUM('moto','bike','carro','a_pe') NOT NULL DEFAULT 'moto',
	placa         VARCHAR(10)  NULL,
	disponivel    TINYINT(1)   NOT NULL DEFAULT 0, -- "ficar online"
	lat           DECIMAL(10,7) NULL,               -- última posição conhecida
	lng           DECIMAL(10,7) NULL,
	atualizado_em DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	criado_em     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_entregadores_usuario FOREIGN KEY (usuario_id)
		REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 3) Vínculo do pedido com o entregador e com o endereço de
--    entrega escolhido (destino da 2ª perna da corrida).
-- ---------------------------------------------------------
ALTER TABLE pedidos
	ADD COLUMN entregador_id INT UNSIGNED NULL AFTER loja_id,
	ADD COLUMN endereco_id   INT UNSIGNED NULL AFTER entregador_id,
	ADD CONSTRAINT fk_pedidos_entregador FOREIGN KEY (entregador_id)
		REFERENCES entregadores(id) ON DELETE SET NULL,
	ADD CONSTRAINT fk_pedidos_endereco FOREIGN KEY (endereco_id)
		REFERENCES enderecos(id) ON DELETE SET NULL;
