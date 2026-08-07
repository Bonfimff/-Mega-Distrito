-- =========================================================
-- MEGA DISTRITO — Correção pontual (produção / VPS)
-- ---------------------------------------------------------
-- A tabela `lojas` foi esvaziada/recriada em algum momento
-- (provavelmente quando migration_anuncios.sql criou a
-- "Loja de Exemplo" numa tabela `lojas` já vazia, virando
-- id=1 em vez de conviver com Loja Central/Drogaria
-- Central/Serviços Pro nos ids 1/2/3 originais).
--
-- `itens`, `loja_filtros` e `apps_catalogo` ainda guardam
-- referências para os ids antigos (1/2/3), que hoje ou não
-- existem mais ou apontam erroneamente para "Loja de
-- Exemplo". Este script recria as 3 lojas que sumiram e
-- realinha todas as referências pelo slug/pelo item real,
-- sem depender de nenhum id fixo.
--
-- Seguro rodar mais de uma vez? NÃO — só rodar uma vez.
-- =========================================================

USE mega_distrito;

-- ---------------------------------------------------------
-- 1) Recriar as 3 lojas que sumiram (dados de database/seed.sql)
-- ---------------------------------------------------------
INSERT INTO lojas (slug, nome, categoria, subtitulo, endereco, endereco_url, telefone, whatsapp, cor_primaria, cor_destaque, banner_url, card_url, icone_url, horario_abre, horario_fecha) VALUES
('loja-central', 'Loja Central', 'Alimentação', 'Ofertas e novidades para você',
	'Rua Principal, 123 - Magé', 'https://maps.google.com', '21999990201', '21999990201',
	'#2e7d32', '#1565c0',
	'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
	'https://images.unsplash.com/photo-1468495244123-6c6f332b7a90?auto=format&fit=crop&w=900&q=80',
	'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=200&q=80',
	'09:00:00', '18:00:00'),
('drogaria-central', 'Drogaria Central', 'Beleza e Saúde', 'Entrega de remédios para todo o município, 24h',
	'Av. Central, 45 - Centro, Magé', 'https://maps.google.com', '21999990202', '21999990202',
	'#8e24aa', '#00897b',
	'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80',
	'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=900&q=80',
	'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=200&q=80',
	'00:00:00', '23:59:00'),
('servicos-pro', 'Serviços Pro', 'Serviços Gerais', 'Encontre profissionais para elétrica, limpeza, reformas e mais',
	NULL, NULL, NULL, NULL, '#1565c0', '#2e7d32', NULL, NULL, NULL, '08:00:00', '18:00:00');

-- ---------------------------------------------------------
-- 2) Realinhar itens que hoje apontam para os ids antigos
--    (1 = Combo da Casa, 2/3 = Dipirona/Aferição, 4 = Instalação)
-- ---------------------------------------------------------
UPDATE itens SET loja_id = (SELECT id FROM lojas WHERE slug = 'loja-central') WHERE id = 1;
UPDATE itens SET loja_id = (SELECT id FROM lojas WHERE slug = 'drogaria-central') WHERE id IN (2, 3);
UPDATE itens SET loja_id = (SELECT id FROM lojas WHERE slug = 'servicos-pro') WHERE id = 4;

-- ---------------------------------------------------------
-- 3) Realinhar loja_filtros
-- ---------------------------------------------------------
UPDATE loja_filtros SET loja_id = (SELECT id FROM lojas WHERE slug = 'loja-central') WHERE id IN (1, 2);
UPDATE loja_filtros SET loja_id = (SELECT id FROM lojas WHERE slug = 'drogaria-central') WHERE id IN (3, 4);

-- ---------------------------------------------------------
-- 4) Realinhar apps_catalogo (Serviços Pro / Farmácia 24h / Painel do Lojista)
-- ---------------------------------------------------------
UPDATE apps_catalogo SET loja_id = (SELECT id FROM lojas WHERE slug = 'servicos-pro') WHERE id = 3;
UPDATE apps_catalogo SET loja_id = (SELECT id FROM lojas WHERE slug = 'drogaria-central') WHERE id = 5;
UPDATE apps_catalogo SET loja_id = (SELECT id FROM lojas WHERE slug = 'loja-central') WHERE id = 10;

-- ---------------------------------------------------------
-- 5) Realinhar pedidos/mensagens usando o item real como fonte
--    da verdade (evita depender dos ids antigos de loja)
-- ---------------------------------------------------------
UPDATE pedidos p JOIN itens i ON p.item_id = i.id SET p.loja_id = i.loja_id WHERE i.loja_id IS NOT NULL;
UPDATE mensagens m JOIN itens i ON m.item_id = i.id SET m.loja_id = i.loja_id WHERE i.loja_id IS NOT NULL;

-- ---------------------------------------------------------
-- Verificação
-- ---------------------------------------------------------
SELECT id, slug, nome FROM lojas ORDER BY id;
SELECT id, loja_id, usuario_id, nome FROM itens ORDER BY id;
SELECT id, nome, loja_id FROM apps_catalogo ORDER BY id;
