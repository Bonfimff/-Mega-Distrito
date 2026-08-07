-- =========================================================
-- MEGA DISTRITO — Dados de exemplo (mesmos dados hoje
-- hard-coded em JS/data/*.js, gerenciamento.js e conta.js).
-- Rodar depois de schema.sql, em um banco recém-criado.
-- =========================================================

USE mega_distrito;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- Categorias (JS/data/categorias.js)
-- ---------------------------------------------------------
INSERT INTO categorias (id, nome, icone) VALUES
	('eletronicos', 'Eletrônicos',    'fas fa-laptop'),
	('casa',        'Casa e Cozinha', 'fas fa-blender'),
	('ferramentas', 'Ferramentas',    'fas fa-tools'),
	('moda',        'Moda',           'fas fa-tshirt');

-- ---------------------------------------------------------
-- Usuário de demonstração (ver HTML/conta.html)
-- ---------------------------------------------------------
INSERT INTO usuarios (id, nome, email, senha_hash, telefone, email_verificado) VALUES
	(1, 'Ana Paula Ferreira', 'ana.ferreira@email.com', '$2y$10$demo.hash.nao.use.em.producao', '(21) 99876-5432', 1);

INSERT INTO enderecos (usuario_id, apelido, rua, bairro, cidade, cep, lat, lng, padrao) VALUES
	(1, 'Casa', 'Rua Principal, 123', 'Centro', 'Magé - RJ', '25900-000', -22.6668, -43.0393, 1);

-- ---------------------------------------------------------
-- Contas de demonstração — vendedores do bazar (JS/data/produtos.js)
-- ---------------------------------------------------------
INSERT INTO usuarios (id, nome, email, senha_hash, email_verificado) VALUES
	(2,  'Rafael M.',    'demo.rafael.m@mage.exemplo',    '$2y$10$demo.hash.nao.use.em.producao', 1),
	(3,  'Ana Paula S.',  'demo.anapaula.s@mage.exemplo',  '$2y$10$demo.hash.nao.use.em.producao', 1),
	(4,  'Lucas F.',      'demo.lucas.f@mage.exemplo',     '$2y$10$demo.hash.nao.use.em.producao', 1),
	(5,  'Cláudia R.',    'demo.claudia.r@mage.exemplo',   '$2y$10$demo.hash.nao.use.em.producao', 1),
	(6,  'Jorge P.',      'demo.jorge.p@mage.exemplo',     '$2y$10$demo.hash.nao.use.em.producao', 1),
	(7,  'Fernanda L.',   'demo.fernanda.l@mage.exemplo',  '$2y$10$demo.hash.nao.use.em.producao', 1),
	(8,  'Carlos A.',     'demo.carlos.a@mage.exemplo',    '$2y$10$demo.hash.nao.use.em.producao', 1),
	(9,  'Marcos T.',     'demo.marcos.t@mage.exemplo',    '$2y$10$demo.hash.nao.use.em.producao', 1),
	(10, 'Beatriz O.',    'demo.beatriz.o@mage.exemplo',   '$2y$10$demo.hash.nao.use.em.producao', 1),
	(11, 'Talita B.',     'demo.talita.b@mage.exemplo',    '$2y$10$demo.hash.nao.use.em.producao', 1),
	(12, 'Patrícia G.',   'demo.patriciag@mage.exemplo',   '$2y$10$demo.hash.nao.use.em.producao', 1),
	(13, 'Eduardo N.',    'demo.eduardo.n@mage.exemplo',   '$2y$10$demo.hash.nao.use.em.producao', 1);

-- ---------------------------------------------------------
-- Contas de demonstração — profissionais (JS/data/profissionais.js)
-- ---------------------------------------------------------
INSERT INTO usuarios (id, nome, email, senha_hash, telefone, email_verificado) VALUES
	(14, 'João Carlos Silva', 'demo.joaocarlos@mage.exemplo',  '$2y$10$demo.hash.nao.use.em.producao', '21999990001', 1),
	(15, 'Marcos Andrade',    'demo.marcosandrade@mage.exemplo','$2y$10$demo.hash.nao.use.em.producao', '21999990002', 1),
	(16, 'Roberto Fonseca',   'demo.robertofonseca@mage.exemplo','$2y$10$demo.hash.nao.use.em.producao', '21999990003', 1),
	(17, 'Sandra Oliveira',   'demo.sandraoliveira@mage.exemplo','$2y$10$demo.hash.nao.use.em.producao', '21999990004', 1),
	(18, 'Felipe Rocha',      'demo.feliperocha@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', '21999990005', 1),
	(19, 'Camila Ferreira',   'demo.camilaferreira@mage.exemplo','$2y$10$demo.hash.nao.use.em.producao', '21999990006', 1),
	(20, 'Antônio Pereira',   'demo.antoniopereira@mage.exemplo','$2y$10$demo.hash.nao.use.em.producao', '21999990007', 1),
	(21, 'Tiago Souza',       'demo.tiagosouza@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', '21999990008', 1),
	(22, 'Patrícia Gomes',    'demo.patriciagomes@mage.exemplo','$2y$10$demo.hash.nao.use.em.producao', '21999990009', 1),
	(23, 'Wesley Nascimento', 'demo.wesleyn@mage.exemplo',     '$2y$10$demo.hash.nao.use.em.producao', '21999990010', 1);

-- ---------------------------------------------------------
-- Contas de demonstração — empresas que publicam vagas (JS/data/vagas.js)
-- ---------------------------------------------------------
INSERT INTO usuarios (id, nome, email, senha_hash, email_verificado) VALUES
	(24, 'Mercado Central Magé',     'demo.mercadocentral@mage.exemplo',  '$2y$10$demo.hash.nao.use.em.producao', 1),
	(25, 'Construtora Bramax',       'demo.bramax@mage.exemplo',          '$2y$10$demo.hash.nao.use.em.producao', 1),
	(26, 'Prefeitura de Magé',       'demo.prefeitura@mage.exemplo',      '$2y$10$demo.hash.nao.use.em.producao', 1),
	(27, 'Restaurante Sabor Real',   'demo.saborreal@mage.exemplo',       '$2y$10$demo.hash.nao.use.em.producao', 1),
	(28, 'Clínica Saúde Magé',       'demo.clinicasaude@mage.exemplo',    '$2y$10$demo.hash.nao.use.em.producao', 1),
	(29, 'DistribuiMagé Logística',  'demo.distribuimage@mage.exemplo',   '$2y$10$demo.hash.nao.use.em.producao', 1),
	(30, 'Academia Fit Magé',        'demo.academiafit@mage.exemplo',     '$2y$10$demo.hash.nao.use.em.producao', 1),
	(31, 'Obras Piabetá',            'demo.obraspiabeta@mage.exemplo',    '$2y$10$demo.hash.nao.use.em.producao', 1),
	(32, 'Agência Digital Local',    'demo.agenciadigital@mage.exemplo',  '$2y$10$demo.hash.nao.use.em.producao', 1),
	(33, 'Escola Estadual Magé',     'demo.escolaestadual@mage.exemplo',  '$2y$10$demo.hash.nao.use.em.producao', 1);

-- ---------------------------------------------------------
-- Lojas (JS/data/lojas.js) + Loja de Exemplo (dona da vitrine
-- geral, que hoje não pertence a nenhum lojista real)
-- ---------------------------------------------------------
INSERT INTO lojas (id, slug, nome, categoria, subtitulo, endereco, endereco_url, lat, lng, telefone, whatsapp, cor_primaria, cor_destaque, banner_url, card_url, icone_url, horario_abre, horario_fecha) VALUES
	(1, 'loja-central', 'Loja Central', 'Alimentação', 'Ofertas e novidades para você',
		'Rua Principal, 123 - Magé', 'https://maps.google.com', -22.6660, -43.0400, '21999990201', '21999990201',
		'#2e7d32', '#1565c0',
		'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
		'https://images.unsplash.com/photo-1468495244123-6c6f332b7a90?auto=format&fit=crop&w=900&q=80',
		'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=200&q=80',
		'09:00:00', '18:00:00'),
	(2, 'drogaria-central', 'Drogaria Central', 'Beleza e Saúde', 'Entrega de remédios para todo o município, 24h',
		'Av. Central, 45 - Centro, Magé', 'https://maps.google.com', -22.6640, -43.0370, '21999990202', '21999990202',
		'#8e24aa', '#00897b',
		'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80',
		'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=900&q=80',
		'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=200&q=80',
		'00:00:00', '23:59:00'),
	(3, 'servicos-pro', 'Serviços Pro', 'Serviços Gerais', 'Encontre profissionais para elétrica, limpeza, reformas e mais',
		NULL, NULL, NULL, NULL, NULL, NULL, '#1565c0', '#2e7d32', NULL, NULL, NULL, '08:00:00', '18:00:00'),
	(4, 'loja-exemplo', 'Loja de Exemplo', 'Vitrine Geral', 'Produtos de demonstração da vitrine principal',
		NULL, NULL, NULL, NULL, NULL, NULL, '#455a64', '#607d8b', NULL, NULL, NULL, '00:00:00', '23:59:00');

INSERT INTO loja_filtros (id, loja_id, nome, valor) VALUES
	(1, 1, 'Bebidas', 'bebidas'),
	(2, 1, 'Combo', 'combo'),
	(3, 2, 'Medicamentos', 'medicamentos'),
	(4, 2, 'Higiene', 'higiene');

-- ---------------------------------------------------------
-- Itens do catálogo das lojas (loja_id)
-- ---------------------------------------------------------
INSERT INTO itens (id, loja_id, tipo, nome, descricao, preco, foto_url, categoria, subcategoria, marca, quantidade, entrega, retirada) VALUES
	(1, 1, 'produto', 'Combo da Casa', 'Lanche artesanal com bebida e acompanhamento.', 39.90,
		'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
		'Alimentação', 'Combo', NULL, 5, 1, 1),
	(2, 2, 'produto', 'Dipirona 500mg (20 comprimidos)', 'Analgésico e antitérmico. Entrega em até 40 minutos.', 8.90,
		'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
		'Beleza e Saúde', 'Medicamentos', 'Genérico', 30, 1, 1),
	(3, 2, 'servico', 'Aferição de Pressão', 'Serviço gratuito na loja, sem agendamento.', 0.00,
		'https://images.unsplash.com/photo-1615486364134-e4e2ce429fa8?auto=format&fit=crop&w=900&q=80',
		'Beleza e Saúde', 'Serviços', NULL, NULL, 0, 1),
	(4, 3, 'servico', 'Instalação Residencial', 'Serviço técnico com atendimento no mesmo dia.', 120.00,
		'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
		'Serviços Gerais', 'Instalação', NULL, NULL, 0, 1);

-- ---------------------------------------------------------
-- Vitrine geral "nova" (JS/data/produtos.js — PRODUTOS)
-- dona: Loja de Exemplo (id 4)
-- ---------------------------------------------------------
INSERT INTO itens (id, loja_id, tipo, nome, preco, preco_antigo, categoria, avaliacao, avaliacoes, badge) VALUES
	(8,  4, 'produto', 'Smartphone Galaxy A55',      1299.90, 1599.90, 'eletronicos', 4.5, 128, 'Novo'),
	(9,  4, 'produto', 'Fone Bluetooth Premium',      199.90,  249.90, 'eletronicos', 4.8, 256, 'Top'),
	(10, 4, 'produto', 'Notebook Ultrafino i5',      2899.90, 3499.90, 'eletronicos', 4.6,  89, 'Oferta'),
	(11, 4, 'produto', 'Panela de Pressão 7 L',        129.90, NULL,    'casa',        4.4, 312, NULL),
	(12, 4, 'produto', 'Kit Organizador Doméstico',      89.90,  119.90, 'casa',        4.2, 174, 'Promoção'),
	(13, 4, 'produto', 'Ventilador de Mesa 40 cm',      159.90, NULL,    'casa',        4.0,  95, NULL),
	(14, 4, 'produto', 'Furadeira de Impacto 750 W',    349.90,  429.90, 'ferramentas', 4.7, 203, 'Top'),
	(15, 4, 'produto', 'Caixa de Ferramentas 22"',      189.90, NULL,    'ferramentas', 4.5, 147, NULL),
	(16, 4, 'produto', 'Serra Circular 7¼"',            499.90,  599.90, 'ferramentas', 4.6,  68, 'Oferta'),
	(17, 4, 'produto', 'Camiseta Básica Premium',        59.90,   79.90, 'moda',        4.3, 421, NULL),
	(18, 4, 'produto', 'Tênis Esportivo Runner',        289.90,  399.90, 'moda',        4.9, 567, 'Destaque'),
	(19, 4, 'produto', 'Jaqueta Corta-Vento',           179.90,  229.90, 'moda',        4.4, 189, 'Promoção');

-- ---------------------------------------------------------
-- Bazar / usados (JS/data/produtos.js — PRODUTOS_USADOS)
-- dono: conta do próprio vendedor (usuario_id)
-- ---------------------------------------------------------
INSERT INTO itens (id, usuario_id, tipo, nome, descricao, preco, preco_antigo, categoria, condicao, bairro) VALUES
	(20, 2,  'produto', 'Smartphone Samsung S21 (256 GB)', 'Sem arranhões, bateria 92%. Acompanha carregador e caixa original.', 1200.00, 3500.00, 'eletronicos', 'otimo',   'Centro, Magé'),
	(21, 3,  'produto', 'Notebook Dell Inspiron 15"', 'Intel i5 10ª geração, 8 GB RAM, SSD 256 GB. Pequeno risco na tampa.', 1350.00, 3200.00, 'eletronicos', 'bom',     'Suruí, Magé'),
	(22, 4,  'produto', 'Fone JBL Tune 510BT', 'Funcionando perfeitamente, uso de 4 meses. Sem caixa.', 89.00, 199.00, 'eletronicos', 'bom',     'Fragoso, Magé'),
	(23, 5,  'produto', 'Jogo de Panelas Tramontina (7 peças)', 'Jogo completo antiaderente, leve desgaste no exterior. Ótimo para uso diário.', 120.00, 350.00, 'casa', 'bom', 'Santo Aleixo, Magé'),
	(24, 6,  'produto', 'Ar-Condicionado Split 12.000 BTU', 'Higienizado recentemente. Gelando muito bem, com controle remoto.', 800.00, 2500.00, 'casa', 'otimo', 'Barbuda, Magé'),
	(25, 7,  'produto', 'Mesa de Jantar 6 Cadeiras', 'Madeira maciça, precisa de envernizamento. Estrutura firme, cadeiras sem avaria.', 380.00, 1200.00, 'casa', 'regular', 'Mauá, Magé'),
	(26, 8,  'produto', 'Furadeira Bosch 500W', 'Pouco uso, guardada há 2 anos. Acompanha maleta e acessórios originais.', 180.00, 480.00, 'ferramentas', 'otimo', 'Piabetá, Magé'),
	(27, 9,  'produto', 'Conjunto de Chaves (40 peças)', 'Chaves allen, fendas e philips. Caixa plástica com pequena trinca na tampa.', 55.00, 150.00, 'ferramentas', 'bom', 'Inhomirim, Magé'),
	(28, 10, 'produto', 'Tênis Nike Air Max 42', 'Usado 3 vezes apenas. Sem defeitos, sola perfeita. Acompanha caixa.', 250.00, 850.00, 'moda', 'otimo', 'Centro, Magé'),
	(29, 11, 'produto', 'Jaqueta Couro Sintético G', 'Pouco uso, apenas pequeno desgaste na gola. Cor preta, tamanho G.', 95.00, 249.00, 'moda', 'bom', 'Raiz da Serra, Magé'),
	(30, 12, 'produto', 'Bicicleta Infantil Aro 20', 'Guidão e selim ajustáveis, pneus bons, com rodinhas. Cor azul.', 150.00, 450.00, 'outros', 'bom', 'Cachoeiras, Magé'),
	(31, 13, 'produto', 'Estante de Livros 5 Prateleiras', 'MDF, algumas marcas de uso. Fácil desmontagem, retirar no local.', 80.00, 299.00, 'outros', 'regular', 'Magé Centro');

-- ---------------------------------------------------------
-- Pedidos (ver GM_PEDIDOS em gerenciamento.js e
-- CONTA_PEDIDOS_SEED em conta.js — mesmo status, duas telas)
-- ---------------------------------------------------------
INSERT INTO pedidos (id, usuario_id, loja_id, item_id, tipo, status, valor, codigo_rastreio) VALUES
	(1, 1, 1, 1, 'produto', 'aguardando_pagamento', 39.90,  NULL),
	(2, 1, 2, 2, 'produto', 'preparando',            8.90,   NULL),
	(3, 1, 4, 4, 'servico', 'a_caminho',            120.00, 'BR998877665BR');

-- ---------------------------------------------------------
-- Mensagens e interações (ver GM_MENSAGENS em gerenciamento.js)
-- ---------------------------------------------------------
INSERT INTO mensagens (id, loja_id, usuario_id, item_id, tipo, texto, lida) VALUES
	(1, 1, 1, 1, 'compra',    'O combo ainda está disponível para hoje?', 1),
	(2, 2, 1, 2, 'interacao', 'Vocês entregam depois das 22h?', 0);

-- ---------------------------------------------------------
-- Loja de aplicativos (JS/data/apps-catalogo.js)
-- ---------------------------------------------------------
INSERT INTO apps_catalogo (id, nome, loja_id, descricao, icone_classe, cor, categoria, url, destaque, selo) VALUES
	(1, 'Mercado Express', NULL, 'Ofertas rápidas e produtos em destaque da semana.', 'fas fa-bolt', '#2e7d32', 'mercado', '#produtos', 1, 'Mais usado'),
	(2, 'Bazar Local', NULL, 'Compre usados em bom estado direto com vendedores locais.', 'fas fa-recycle', '#ef6c00', 'bazar', '#bazar', 1, NULL),
	(3, 'Serviços Pro', 3, 'Encontre profissionais para elétrica, limpeza, reformas e mais.', 'fas fa-hard-hat', '#1565c0', 'servicos', 'HTML/servicos.html', 0, NULL),
	(4, 'Feed da Cidade', NULL, 'Novidades, postagens e anúncios da comunidade de Magé.', 'fas fa-stream', '#00897b', 'comunidade', 'HTML/feed.html', 0, NULL),
	(5, 'Farmácia 24h', 2, 'Entrega de remédios e itens de farmácia para todo o município.', 'fas fa-clinic-medical', '#8e24aa', 'saude', '#', 0, '24h'),
	(6, 'Pet Shop Mágico', NULL, 'Ração, banho e tosa, e itens para seu pet em um clique.', 'fas fa-paw', '#5d4037', 'pets', '#', 0, NULL),
	(7, 'Salão Bella', NULL, 'Agende cabelo, unha e estética facial sem sair de casa.', 'fas fa-spa', '#d81b60', 'beleza', '#', 1, 'Novo'),
	(8, 'Moda & Cia', NULL, 'Roupas, calçados e acessórios das marcas que você ama.', 'fas fa-shirt', '#5c35a8', 'moda', '#', 0, 'Novo'),
	(9, 'Oficina do Zé', NULL, 'Revisão, troca de óleo e socorro mecânico no município.', 'fas fa-car', '#37474f', 'servicos', '#', 0, NULL),
	(10, 'Painel do Lojista', 1, 'Gerencie sua loja: produtos, pedidos, mensagens e indicadores de vendas.', 'fas fa-store', '#1b5e20', 'lojista', 'HTML/gerenciamento.html', 1, 'Seu app'),
	(11, 'Painel do Entregador', NULL, 'Veja entregas disponíveis no mapa, aceite e navegue até o endereço.', 'fas fa-motorcycle', '#e65100', 'entregador', 'HTML/entregador.html', 1, 'Novo');

-- ---------------------------------------------------------
-- Perfis de profissionais (JS/data/profissionais.js)
-- ---------------------------------------------------------
INSERT INTO perfis_profissionais (id, usuario_id, especialidade, ocupacao, descricao, avaliacao, avaliacoes, verificado, disponivel, bairro, atende, horario, preco, unidade, telefone) VALUES
	(1,  14, 'construcao', 'Pedreiro & Azulejista',
		'Especialista em alvenaria, assentamento de pisos, revestimentos e pequenas reformas residenciais.',
		4.8, 74,  1, 1, 'Centro, Magé',        'Magé e região',      'Seg—Sáb: 07h—17h', 200, 'diária', '21999990001'),
	(2,  15, 'eletrica', 'Eletricista Residencial',
		'Instalações elétricas residenciais e comerciais, quadros de distribuição, SPDA e tomadas.',
		5.0, 112, 1, 1, 'Piabetá, Magé',       'Magé e Guapimirim',  'Seg—Sex: 08h—18h | Sáb: 08h—12h', 120, 'hora', '21999990002'),
	(3,  16, 'hidraulica', 'Encanador & Hidráulico',
		'Conserto de vazamentos, instalação de boxes, torneiras, chuveiros e caixas d''água.',
		4.7, 89,  1, 0, 'Mauá, Magé',          'Magé e região',      'Seg—Sex: 07h—17h', 150, 'hora', '21999990003'),
	(4,  17, 'limpeza', 'Diarista & Faxineira',
		'Limpeza residencial completa, pós-obra, escritórios e eventos. Produto de qualidade incluso.',
		4.9, 203, 1, 1, 'Centro, Magé',        'Magé e região',      'Seg—Sáb: 08h—17h', 180, 'diária', '21999990004'),
	(5,  18, 'tecnologia', 'Técnico de Informática',
		'Formatação, montagem de PCs, redes Wi-Fi, CFTV, instalação de programas e suporte remoto.',
		4.6, 58,  0, 1, 'Piedade, Magé',       'Magé e região',      'Seg—Sex: 09h—19h | Sáb: 09h—14h', 80, 'hora', '21999990005'),
	(6,  19, 'beleza', 'Manicure & Cabeleireira',
		'Atendimento em domicílio. Manicure, pedicure, escova, coloração e alongamento de unhas.',
		4.9, 347, 1, 1, 'Fragoso, Magé',       'Magé e região',      'Seg—Sáb: 09h—20h', 60, 'serviço', '21999990006'),
	(7,  20, 'construcao', 'Pintor Predial & Residencial',
		'Pintura interna, externa, textura, grafiato e epóxi para pisos. Acabamento impecável.',
		4.5, 61,  0, 1, 'Santo Aleixo, Magé',  'Magé e região',      'Seg—Sáb: 07h—17h', 180, 'diária', '21999990007'),
	(8,  21, 'construcao', 'Marceneiro & Instalador',
		'Montagem de móveis planejados, portas, janelas, decks e pequenos consertos em madeira.',
		4.7, 44,  1, 0, 'Vila Inhomirim, Magé','Magé e região',      'Seg—Sex: 08h—17h', 120, 'hora', '21999990008'),
	(9,  22, 'outros', 'Cuidadora de Idosos',
		'Cuidados diurnos e noturnos, acompanhamento médico, higiene pessoal e companhia.',
		5.0, 29,  1, 1, 'Raiz da Serra, Magé', 'Magé e Guapimirim',  'Disponível 24h (combinar)', 220, 'diária', '21999990009'),
	(10, 23, 'outros', 'Jardineiro & Paisagista',
		'Corte de grama, poda de árvores, plantio, paisagismo e manutenção de jardins.',
		4.4, 37,  0, 1, 'Suruí, Magé',         'Magé e região',      'Seg—Sáb: 07h—16h', 150, 'diária', '21999990010');

INSERT INTO perfil_profissional_tags (perfil_id, tag) VALUES
	(1, 'Pedreiro'), (1, 'Azulejista'), (1, 'Reforma'), (1, 'Pinturas'),
	(2, 'Elétrica'), (2, 'Instalações'), (2, 'SPDA'), (2, 'Iluminação'),
	(3, 'Encanamento'), (3, 'Infiltração'), (3, 'Caixa D''água'), (3, 'Box'),
	(4, 'Limpeza'), (4, 'Faxina'), (4, 'Pós-obra'), (4, 'Escritório'),
	(5, 'Informática'), (5, 'Redes'), (5, 'CFTV'), (5, 'Formatação'),
	(6, 'Manicure'), (6, 'Pedicure'), (6, 'Cabelo'), (6, 'Alongamento'),
	(7, 'Pintura'), (7, 'Textura'), (7, 'Grafiato'), (7, 'Epóxi'),
	(8, 'Marcenaria'), (8, 'Móveis'), (8, 'Deck'), (8, 'Portas'),
	(9, 'Cuidadora'), (9, 'Idosos'), (9, 'Enfermagem'), (9, 'Diário/Noturno'),
	(10, 'Jardinagem'), (10, 'Paisagismo'), (10, 'Poda'), (10, 'Manutenção');

-- ---------------------------------------------------------
-- Conta de demonstração — entregador (HTML/entregador.html)
-- ---------------------------------------------------------
INSERT INTO usuarios (id, nome, email, senha_hash, telefone, email_verificado) VALUES
	(34, 'Bruno Andrade', 'demo.brunoandrade@mage.exemplo', '$2y$10$demo.hash.nao.use.em.producao', '21999990011', 1);

INSERT INTO entregadores (usuario_id, veiculo, placa, disponivel, lat, lng) VALUES
	(34, 'moto', 'ABC1D23', 0, -22.6650, -43.0385);

-- ---------------------------------------------------------
-- Vagas de emprego (JS/data/vagas.js)
-- ---------------------------------------------------------
INSERT INTO vagas_emprego (id, usuario_id, cargo, empresa, area, regime, salario, local, descricao, contato) VALUES
	(1,  24, 'Atendente de Loja',           'Mercado Central Magé',   'comercio',    'CLT',        'R$ 1.518',            'Centro, Magé',      'Atendimento ao cliente, organização de gôndolas e frente de caixa. Experiência desejável.', '21999990101'),
	(2,  25, 'Auxiliar de Pedreiro',        'Construtora Bramax',     'construcao',  'CLT',        'R$ 1.700',            'Piabetá, Magé',     'Suporte em obras residenciais. Necessário ter experiência mínima de 6 meses.', '21999990102'),
	(3,  26, 'Técnico de TI / Suporte',     'Prefeitura de Magé',     'tecnologia',  'Temporário', 'R$ 2.200',            'Centro, Magé',      'Suporte técnico em hardware e software para equipamentos da prefeitura. Necessário diploma técnico.', '21999990103'),
	(4,  27, 'Cozinheira / Cozinheiro',     'Restaurante Sabor Real', 'servicos',    'CLT',        'A combinar',          'Suruí, Magé',       'Preparo de pratos executivos e a la carte. Experiência em cozinha industrial é diferencial.', '21999990104'),
	(5,  28, 'Auxiliar de Enfermagem',      'Clínica Saúde Magé',     'saude',       'CLT',        'R$ 1.900',            'Centro, Magé',      'Assistência a pacientes, coleta de amostras e apoio em procedimentos clínicos.', '21999990105'),
	(6,  29, 'Motorista Entregador',        'DistribuiMagé Logística','servicos',    'CLT',        'R$ 2.000 + comissão', 'Magé',              'Entrega de mercadorias em Magé e municípios vizinhos. CNH B obrigatória.', '21999990106'),
	(7,  30, 'Recepcionista',               'Academia Fit Magé',      'servicos',    'CLT',        'R$ 1.518',            'Barbuda, Magé',     'Recepção de alunos, controle de acesso, agendamentos e suporte administrativo.', '21999990107'),
	(8,  31, 'Eletricista Autônomo',        'Obras Piabetá',          'construcao',  'Autônomo',   'A combinar',          'Piabetá, Magé',     'Instalações elétricas em obra de médio porte. Disponibilidade imediata.', '21999990108'),
	(9,  32, 'Designer Gráfico Freelancer', 'Agência Digital Local',  'tecnologia',  'Freelancer', 'R$ 80–120/peça',      'Remoto / Magé',     'Criação de posts para redes sociais, flyers e identidade visual. Portfólio obrigatório.', '21999990109'),
	(10, 33, 'Auxiliar de Limpeza',         'Escola Estadual Magé',   'outros',      'CLT',        'R$ 1.518',            'Centro, Magé',      'Serviços de limpeza e conservação em ambiente escolar. Turnos manhã ou tarde.', '21999990110');

SET FOREIGN_KEY_CHECKS = 1;
