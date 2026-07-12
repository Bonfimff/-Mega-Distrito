'use strict';

/* =========================================================
   MAGÉ EXPRESS — DADOS: PRODUTOS (novos e bazar/usados)
   ========================================================= */

const PRODUTOS = [
    {
        id: 1, nome: 'Smartphone Galaxy A55',       categoria: 'eletronicos',
        preco: 1299.90, precoAntigo: 1599.90,
        emoji: '🛍️', avaliacao: 4.5, avaliacoes: 128, badge: 'Novo',  badgeCls: 'badge-novo',
    },
    {
        id: 2, nome: 'Fone Bluetooth Premium',      categoria: 'eletronicos',
        preco: 199.90,  precoAntigo: 249.90,
        emoji: '🛍️', avaliacao: 4.8, avaliacoes: 256, badge: 'Top',   badgeCls: 'badge-top',
    },
    {
        id: 3, nome: 'Notebook Ultrafino i5',       categoria: 'eletronicos',
        preco: 2899.90, precoAntigo: 3499.90,
        emoji: '🛍️', avaliacao: 4.6, avaliacoes:  89, badge: 'Oferta', badgeCls: 'sale',
    },
    {
        id: 4, nome: 'Panela de Pressão 7 L',       categoria: 'casa',
        preco: 129.90,  precoAntigo: null,
        emoji: '🛍️', avaliacao: 4.4, avaliacoes: 312, badge: null,    badgeCls: '',
    },
    {
        id: 5, nome: 'Kit Organizador Doméstico',   categoria: 'casa',
        preco: 89.90,   precoAntigo: 119.90,
        emoji: '🛍️', avaliacao: 4.2, avaliacoes: 174, badge: 'Promoção', badgeCls: 'sale',
    },
    {
        id: 6, nome: 'Ventilador de Mesa 40 cm',    categoria: 'casa',
        preco: 159.90,  precoAntigo: null,
        emoji: '🛍️', avaliacao: 4.0, avaliacoes:  95, badge: null,    badgeCls: '',
    },
    {
        id: 7, nome: 'Furadeira de Impacto 750 W',  categoria: 'ferramentas',
        preco: 349.90,  precoAntigo: 429.90,
        emoji: '🛍️', avaliacao: 4.7, avaliacoes: 203, badge: 'Top',  badgeCls: 'badge-top',
    },
    {
        id: 8, nome: 'Caixa de Ferramentas 22"',    categoria: 'ferramentas',
        preco: 189.90,  precoAntigo: null,
        emoji: '🛍️', avaliacao: 4.5, avaliacoes: 147, badge: null,   badgeCls: '',
    },
    {
        id: 9, nome: 'Serra Circular 7¼"',          categoria: 'ferramentas',
        preco: 499.90,  precoAntigo: 599.90,
        emoji: '🛍️', avaliacao: 4.6, avaliacoes:  68, badge: 'Oferta', badgeCls: 'sale',
    },
    {
        id: 10, nome: 'Camiseta Básica Premium',    categoria: 'moda',
        preco: 59.90,   precoAntigo: 79.90,
        emoji: '🛍️', avaliacao: 4.3, avaliacoes: 421, badge: null,   badgeCls: '',
    },
    {
        id: 11, nome: 'Tênis Esportivo Runner',     categoria: 'moda',
        preco: 289.90,  precoAntigo: 399.90,
        emoji: '🛍️', avaliacao: 4.9, avaliacoes: 567, badge: 'Destaque', badgeCls: 'badge-top',
    },
    {
        id: 12, nome: 'Jaqueta Corta-Vento',        categoria: 'moda',
        preco: 179.90,  precoAntigo: 229.90,
        emoji: '🛍️', avaliacao: 4.4, avaliacoes: 189, badge: 'Promoção', badgeCls: 'sale',
    },
];

// =====================
// DADOS — BAZAR (USADOS)
// =====================
const PRODUTOS_USADOS = [
    {
        id: 101, nome: 'Smartphone Samsung S21 (256 GB)',
        categoria: 'eletronicos', emoji: '🛍️',
        preco: 1200.00, precoOrig: 3500.00,
        condicao: 'otimo', condicaoLabel: 'Ótimo Estado',
        desc: 'Sem arranhões, bateria 92%. Acompanha carregador e caixa original.',
        vendedor: 'Rafael M.', bairro: 'Centro, Magé',
    },
    {
        id: 102, nome: 'Notebook Dell Inspiron 15"',
        categoria: 'eletronicos', emoji: '🛍️',
        preco: 1350.00, precoOrig: 3200.00,
        condicao: 'bom', condicaoLabel: 'Bom Estado',
        desc: 'Intel i5 10ª geração, 8 GB RAM, SSD 256 GB. Pequeno risco na tampa.',
        vendedor: 'Ana Paula S.', bairro: 'Suruí, Magé',
    },
    {
        id: 103, nome: 'Fone JBL Tune 510BT',
        categoria: 'eletronicos', emoji: '🛍️',
        preco: 89.00, precoOrig: 199.00,
        condicao: 'bom', condicaoLabel: 'Bom Estado',
        desc: 'Funcionando perfeitamente, uso de 4 meses. Sem caixa.',
        vendedor: 'Lucas F.', bairro: 'Fragoso, Magé',
    },
    {
        id: 104, nome: 'Jogo de Panelas Tramontina (7 peças)',
        categoria: 'casa', emoji: '🛍️',
        preco: 120.00, precoOrig: 350.00,
        condicao: 'bom', condicaoLabel: 'Bom Estado',
        desc: 'Jogo completo antiaderente, leve desgaste no exterior. Ótimo para uso diário.',
        vendedor: 'Cláudia R.', bairro: 'Santo Aleixo, Magé',
    },
    {
        id: 105, nome: 'Ar-Condicionado Split 12.000 BTU',
        categoria: 'casa', emoji: '🛍️',
        preco: 800.00, precoOrig: 2500.00,
        condicao: 'otimo', condicaoLabel: 'Ótimo Estado',
        desc: 'Higienizado recentemente. Gelando muito bem, com controle remoto.',
        vendedor: 'Jorge P.', bairro: 'Barbuda, Magé',
    },
    {
        id: 106, nome: 'Mesa de Jantar 6 Cadeiras',
        categoria: 'casa', emoji: '🛍️',
        preco: 380.00, precoOrig: 1200.00,
        condicao: 'regular', condicaoLabel: 'Estado Regular',
        desc: 'Madeira maciça, precisa de envernizamento. Estrutura firme, cadeiras sem avaria.',
        vendedor: 'Fernanda L.', bairro: 'Mauá, Magé',
    },
    {
        id: 107, nome: 'Furadeira Bosch 500W',
        categoria: 'ferramentas', emoji: '🛍️',
        preco: 180.00, precoOrig: 480.00,
        condicao: 'otimo', condicaoLabel: 'Ótimo Estado',
        desc: 'Pouco uso, guardada há 2 anos. Acompanha maleta e acessórios originais.',
        vendedor: 'Carlos A.', bairro: 'Piabetá, Magé',
    },
    {
        id: 108, nome: 'Conjunto de Chaves (40 peças)',
        categoria: 'ferramentas', emoji: '🛍️',
        preco: 55.00, precoOrig: 150.00,
        condicao: 'bom', condicaoLabel: 'Bom Estado',
        desc: 'Chaves allen, fendas e philips. Caixa plástica com pequena trinca na tampa.',
        vendedor: 'Marcos T.', bairro: 'Inhomirim, Magé',
    },
    {
        id: 109, nome: 'Tênis Nike Air Max 42',
        categoria: 'moda', emoji: '🛍️',
        preco: 250.00, precoOrig: 850.00,
        condicao: 'otimo', condicaoLabel: 'Ótimo Estado',
        desc: 'Usado 3 vezes apenas. Sem defeitos, sola perfeita. Acompanha caixa.',
        vendedor: 'Beatriz O.', bairro: 'Centro, Magé',
    },
    {
        id: 110, nome: 'Jaqueta Couro Sintético G',
        categoria: 'moda', emoji: '🛍️',
        preco: 95.00, precoOrig: 249.00,
        condicao: 'bom', condicaoLabel: 'Bom Estado',
        desc: 'Pouco uso, apenas pequeno desgaste na gola. Cor preta, tamanho G.',
        vendedor: 'Talita B.', bairro: 'Raiz da Serra, Magé',
    },
    {
        id: 111, nome: 'Bicicleta Infantil Aro 20',
        categoria: 'outros', emoji: '🛍️',
        preco: 150.00, precoOrig: 450.00,
        condicao: 'bom', condicaoLabel: 'Bom Estado',
        desc: 'Guidão e selim ajustáveis, pneus bons, com rodinhas. Cor azul.',
        vendedor: 'Patrícia G.', bairro: 'Cachoeiras, Magé',
    },
    {
        id: 112, nome: 'Estante de Livros 5 Prateleiras',
        categoria: 'outros', emoji: '🛍️',
        preco: 80.00, precoOrig: 299.00,
        condicao: 'regular', condicaoLabel: 'Estado Regular',
        desc: 'MDF, algumas marcas de uso. Fácil desmontagem, retirar no local.',
        vendedor: 'Eduardo N.', bairro: 'Magé Centro',
    },
];
