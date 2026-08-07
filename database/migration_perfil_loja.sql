-- =========================================================
-- MIGRAÇÃO: perfil da loja + duração de serviço
-- Rodar UMA VEZ no banco já existente da VPS (mega_distrito).
-- Só adiciona colunas novas — não altera nem apaga dado existente.
-- =========================================================

USE mega_distrito;

-- ---------------------------------------------------------
-- 1) Perfil da loja (ver JS/data/perfis-loja.js) — controla quais
--    grupos de campos aparecem no formulário de produto/serviço.
-- ---------------------------------------------------------
ALTER TABLE lojas
	ADD COLUMN perfil VARCHAR(40) NOT NULL DEFAULT 'produtos' AFTER categoria;

-- ---------------------------------------------------------
-- 2) Duração estimada do atendimento (minutos) — só usado por
--    itens do tipo 'servico' em lojas com perfil de agenda.
-- ---------------------------------------------------------
ALTER TABLE itens
	ADD COLUMN duracao_min INT UNSIGNED NULL AFTER quantidade;
