'use strict';

/* =========================================================
   MAGÉ EXPRESS — Script Principal
   Funcionalidades: Produtos · Categorias · Carrinho · Busca
   ========================================================= */

// =====================
// DADOS DAS CATEGORIAS
// =====================
const CATEGORIAS = [
    { id: 'eletronicos', nome: 'Eletrônicos',      icone: 'fas fa-laptop',       qtd: 3 },
    { id: 'casa',        nome: 'Casa e Cozinha',   icone: 'fas fa-blender',      qtd: 3 },
    { id: 'ferramentas', nome: 'Ferramentas',       icone: 'fas fa-tools',        qtd: 3 },
    { id: 'moda',        nome: 'Moda',              icone: 'fas fa-tshirt',       qtd: 3 },
];

// =====================
// DADOS DOS PRODUTOS
// =====================
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

// =====================
// ESTADO DO CARRINHO
// (salvo no localStorage)
// =====================
let carrinho = carregarCarrinho();

// INICIALIZAÇÃO
// INICIALIZAÇÃO
// =====================
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('categories-grid')) renderCategorias();
    if (document.getElementById('products-grid'))   renderProdutos(PRODUTOS);
    if (document.getElementById('bazar-grid'))      renderBazar(PRODUTOS_USADOS);
    atualizarContadorCarrinho();
    if (typeof atualizarContadorAtalhos === 'function') atualizarContadorAtalhos();
    if (typeof renderGavetaApps === 'function') renderGavetaApps();
    if (typeof renderApps === 'function' && document.getElementById('apps-grid')) renderApps();
    bindEventos();
});

/* ─────────────────────────────────────────────
   RENDERIZAÇÃO DE CATEGORIAS
   ───────────────────────────────────────────── */
function renderCategorias() {
    const grid = document.getElementById('categories-grid');
    grid.innerHTML = CATEGORIAS.map(c => `
        <div class="category-card" data-cat="${c.id}" onclick="filtrarCategoria('${c.id}')">
            <div class="category-icon"><i class="${c.icone}"></i></div>
            <h3>${c.nome}</h3>
            <small>${c.qtd} produtos</small>
        </div>
    `).join('');
}

/* ─────────────────────────────────────────────
   RENDERIZAÇÃO DE PRODUTOS
   ───────────────────────────────────────────── */
function renderProdutos(lista) {
    const grid     = document.getElementById('products-grid');
    const msgVazia = document.getElementById('no-results');
    if (!grid) return; // guard: página sem grid de produtos

    if (lista.length === 0) {
        grid.innerHTML  = '';
        msgVazia.style.display = 'block';
        return;
    }

    msgVazia.style.display = 'none';
    grid.innerHTML = lista.map(buildCardHTML).join('');

    // Animação de entrada em cascata
    grid.querySelectorAll('.product-card').forEach((card, i) => {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity .4s ease, transform .4s ease';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
        }, i * 65);
    });
}

function buildCardHTML(p) {
    const badge = p.badge
        ? `<span class="product-badge ${p.badgeCls}">${p.badge}</span>`
        : '';

    const precoAntigo = p.precoAntigo
        ? `<div class="product-price-old">De: ${brl(p.precoAntigo)}</div>`
        : '';

    const parcelas   = Math.max(1, Math.floor(p.preco / 10));
    const vlrParcela = brl(p.preco / parcelas);
    const catNome    = nomeDaCategoria(p.categoria);
    const estrelas   = buildEstrelas(p.avaliacao);

    return `
        <div class="product-card" data-id="${p.id}">
            ${badge}
            <div class="product-img-wrapper">${p.emoji}</div>
            <div class="product-info">
                <span class="product-category">${catNome}</span>
                <h3 class="product-name">${p.nome}</h3>
                <div class="product-rating">
                    <span class="stars">${estrelas}</span>
                    <span class="count">(${p.avaliacoes})</span>
                </div>
                <div class="product-prices">
                    ${precoAntigo}
                    <div class="product-price">${brl(p.preco)}</div>
                    <div class="product-installment">em até ${parcelas}x de ${vlrParcela}</div>
                </div>
                <button class="btn-add-cart" onclick="adicionarAoCarrinho(${p.id})">
                    <i class="fas fa-cart-plus"></i> Comprar
                </button>
            </div>
        </div>
    `;
}

/* ─────────────────────────────────────────────
   FILTROS
   ───────────────────────────────────────────── */
function filtrarCategoria(catId) {
    // Ativa tab
    document.querySelectorAll('.filter-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.filter === catId)
    );
    // Ativa card de categoria
    document.querySelectorAll('.category-card').forEach(c =>
        c.classList.toggle('active', c.dataset.cat === catId)
    );
    renderProdutos(PRODUTOS.filter(p => p.categoria === catId));
    document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
}

function resetarFiltros() {
    document.querySelectorAll('.filter-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.filter === 'todos')
    );
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
    renderProdutos(PRODUTOS);
}

function bindFiltroTabs() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filtro = btn.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');

            if (filtro === 'todos') {
                renderProdutos(PRODUTOS);
            } else {
                renderProdutos(PRODUTOS.filter(p => p.categoria === filtro));
                document.querySelectorAll('.category-card').forEach(c => {
                    if (c.dataset.cat === filtro) c.classList.add('active');
                });
            }
        });
    });
}

/* ─────────────────────────────────────────────
   BUSCA
   ───────────────────────────────────────────── */
function realizarBusca() {
    const termo = document.getElementById('search-input').value.trim().toLowerCase();

    if (!termo) { resetarFiltros(); return; }

    const resultados = PRODUTOS.filter(p =>
        p.nome.toLowerCase().includes(termo) ||
        nomeDaCategoria(p.categoria).toLowerCase().includes(termo)
    );

    // Reset visual dos filtros
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="todos"]').classList.add('active');
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));

    renderProdutos(resultados);
    document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
}

/* ─────────────────────────────────────────────
   CARRINHO — AÇÕES
   ───────────────────────────────────────────── */
function adicionarAoCarrinho(id) {
    const produto = PRODUTOS.find(p => p.id === id);
    if (!produto) return;

    const item = carrinho.find(i => i.id === id);
    if (item) {
        item.quantidade++;
    } else {
        carrinho.push({ ...produto, quantidade: 1 });
    }

    salvarCarrinho();
    atualizarContadorCarrinho();
    pulsarBotaoCarrinho();
    toast(`"${produto.nome}" adicionado ao carrinho!`);
}

function removerDoCarrinho(id) {
    carrinho = carrinho.filter(i => i.id !== id);
    salvarCarrinho();
    atualizarContadorCarrinho();
    renderItensCarrinho();
}

function alterarQuantidade(id, delta) {
    const item = carrinho.find(i => i.id === id);
    if (!item) return;

    item.quantidade += delta;
    if (item.quantidade <= 0) {
        removerDoCarrinho(id);
    } else {
        salvarCarrinho();
        atualizarContadorCarrinho();
        renderItensCarrinho();
    }
}

function limparCarrinho() {
    if (carrinho.length === 0) return;
    if (!confirm('Tem certeza que deseja limpar o carrinho?')) return;
    carrinho = [];
    salvarCarrinho();
    atualizarContadorCarrinho();
    renderItensCarrinho();
    toast('Carrinho esvaziado!');
}

/* ─────────────────────────────────────────────
   CARRINHO — RENDERIZAÇÃO
   ───────────────────────────────────────────── */
function renderItensCarrinho() {
    const container = document.getElementById('cart-items');
    const totalEl   = document.getElementById('cart-total');

    if (carrinho.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Seu carrinho está vazio</p>
                <small>Adicione produtos para continuar</small>
            </div>`;
    } else {
        container.innerHTML = carrinho.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-emoji">${item.emoji}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.nome}</div>
                    <div class="cart-item-price">${brl(item.preco)}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="alterarQuantidade(${item.id}, -1)" aria-label="Diminuir">-</button>
                        <span class="qty-value">${item.quantidade}</span>
                        <button class="qty-btn" onclick="alterarQuantidade(${item.id},  1)" aria-label="Aumentar">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removerDoCarrinho(${item.id})" aria-label="Remover">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `).join('');
    }

    totalEl.textContent = brl(calcularTotal());
}

/* ─────────────────────────────────────────────
   CARRINHO — SIDEBAR (ABRIR / FECHAR)
   ───────────────────────────────────────────── */
function abrirCarrinho() {
    if (typeof fecharGavetaApps === 'function') fecharGavetaApps();
    document.getElementById('cart-sidebar').classList.add('open');
    document.getElementById('overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    renderItensCarrinho();
}

function fecharCarrinho() {
    document.getElementById('cart-sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
    if (!document.getElementById('app-drawer')?.classList.contains('open')) {
        document.body.style.overflow = '';
    }
}

/* ─────────────────────────────────────────────
   CARRINHO — PERSISTÊNCIA
   ───────────────────────────────────────────── */
function salvarCarrinho() {
    try { localStorage.setItem('mage-carrinho', JSON.stringify(carrinho)); }
    catch { /* sem suporte a localStorage — ignora */ }
}

function carregarCarrinho() {
    try { return JSON.parse(localStorage.getItem('mage-carrinho')) || []; }
    catch { return []; }
}

/* ─────────────────────────────────────────────
   CARRINHO — CÁLCULOS
   ───────────────────────────────────────────── */
function calcularTotal() {
    return carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
}
function totalItens() {
    return carrinho.reduce((acc, i) => acc + i.quantidade, 0);
}

function atualizarContadorCarrinho() {
    const n  = totalItens();
    const el = document.getElementById('cart-count');
    el.textContent   = n;
    el.style.display = n === 0 ? 'none' : 'flex';
}

/* ─────────────────────────────────────────────
   CHECKOUT SIMULADO
   ───────────────────────────────────────────── */
function simularCheckout() {
    if (carrinho.length === 0) {
        toast('Adicione ao menos um produto ao carrinho!');
        return;
    }
    toast('✅ Pedido realizado com sucesso! Obrigado pela preferência!');
    carrinho = [];
    salvarCarrinho();
    atualizarContadorCarrinho();
    renderItensCarrinho();
    setTimeout(fecharCarrinho, 2500);
}

/* ─────────────────────────────────────────────
   TOAST NOTIFICATION
   ───────────────────────────────────────────── */
let toastTimer = null;
function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ─────────────────────────────────────────────
   ANIMAÇÃO DO ÍCONE DO CARRINHO
   ───────────────────────────────────────────── */
function pulsarBotaoCarrinho() {
    const el = document.getElementById('cart-count');
    el.classList.remove('pulse');
    void el.offsetWidth; // força reflow
    el.classList.add('pulse');
}

/* ─────────────────────────────────────────────
   HEADER — SOMBRA AO ROLAR
   ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   SCROLL DO HEADER
   ───────────────────────────────────────────── */
function bindHeaderScroll() {
    window.addEventListener('scroll', () => {
        document.getElementById('header')
            .classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}

/* ─────────────────────────────────────────────
   NAV — LINK ATIVO AO ROLAR (INTERSECTION OBSERVER)
   ───────────────────────────────────────────── */
function bindActiveNav() {
    const sections = document.querySelectorAll('section[id], footer[id], [data-nav-anchor][id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link =>
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`)
                );
            }
        });
    }, { threshold: 0.35, rootMargin: '-68px 0px 0px 0px' });

    sections.forEach(s => observer.observe(s));
}

/* ─────────────────────────────────────────────
   HAMBURGER (MENU MOBILE)
   ───────────────────────────────────────────── */
function bindHamburger() {
    const btn = document.getElementById('hamburger');
    const nav = document.getElementById('nav');

    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        nav.classList.toggle('open');
    });

    // Fecha ao clicar em qualquer link
    nav.querySelectorAll('.nav-link').forEach(link =>
        link.addEventListener('click', () => {
            btn.classList.remove('active');
            nav.classList.remove('open');
        })
    );
}

/* ─────────────────────────────────────────────
   BIND DE TODOS OS EVENTOS
   ───────────────────────────────────────────── */
function bindEventos() {
    // Carrinho
    document.getElementById('cart-btn')       .addEventListener('click',   abrirCarrinho);
    document.getElementById('close-cart')     .addEventListener('click',   fecharCarrinho);
    document.getElementById('overlay')        .addEventListener('click',   fecharCarrinho);
    document.getElementById('clear-cart-btn') .addEventListener('click',   limparCarrinho);
    document.getElementById('checkout-btn')   .addEventListener('click',   simularCheckout);

    // Busca
    document.getElementById('search-btn')     .addEventListener('click',   realizarBusca);
    document.getElementById('search-input')   .addEventListener('keydown', e => {
        if (e.key === 'Enter') realizarBusca();
    });

    // Fechar carrinho com Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            fecharCarrinho();
            if (typeof fecharGavetaApps === 'function') fecharGavetaApps();
        }
    });

    // Tabs de filtro (produtos novos)
    bindFiltroTabs();

    // Tabs de filtro do bazar
    bindFiltrosBazar();

    // Apps
    if (typeof bindApps === 'function') bindApps();
    if (typeof bindFloatingBottomNav === 'function') bindFloatingBottomNav();


    // Header
    bindHeaderScroll();
    bindActiveNav();
    bindHamburger();
}

/* ─────────────────────────────────────────────
   BAZAR — RENDERIZAÇÃO
   ───────────────────────────────────────────── */

/** Renderiza o grid de produtos usados */
function renderBazar(lista) {
    const grid     = document.getElementById('bazar-grid');
    const msgVazia = document.getElementById('bazar-no-results');

    if (lista.length === 0) {
        grid.innerHTML = '';
        msgVazia.style.display = 'block';
        return;
    }

    msgVazia.style.display = 'none';
    grid.innerHTML = lista.map(buildBazarCardHTML).join('');

    // Animação em cascata
    grid.querySelectorAll('.bazar-card').forEach((card, i) => {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity .4s ease, transform .4s ease';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
        }, i * 65);
    });
}

/** Gera o HTML de um card do bazar */
function buildBazarCardHTML(item) {
    const condCls = { otimo: 'cond-otimo', bom: 'cond-bom', regular: 'cond-regular' }[item.condicao] || 'cond-bom';
    const economia = ((1 - item.preco / item.precoOrig) * 100).toFixed(0);
    const catNome  = nomeDaCategoriaBazar(item.categoria);
    const inicial  = item.vendedor.charAt(0).toUpperCase();

    return `
        <div class="bazar-card" data-id="${item.id}">
            <span class="bazar-badge-usado"><i class="fas fa-recycle"></i> Usado</span>
            <span class="bazar-condition ${condCls}">${item.condicaoLabel}</span>
            <div class="bazar-img-wrapper">${item.emoji}</div>
            <div class="bazar-info">
                <span class="bazar-cat">${catNome}</span>
                <h3 class="bazar-name">${item.nome}</h3>
                <p class="bazar-desc">${item.desc}</p>
                <div class="bazar-seller">
                    <div class="bazar-seller-avatar">${inicial}</div>
                    <div class="bazar-seller-info">
                        <span class="bazar-seller-name">${item.vendedor}</span>
                        <span class="bazar-seller-local"><i class="fas fa-map-marker-alt"></i> ${item.bairro}</span>
                    </div>
                </div>
                <div class="bazar-prices">
                    <div class="bazar-price-orig">Novo por: ${brl(item.precoOrig)}</div>
                    <div class="bazar-price">${brl(item.preco)}</div>
                    <div class="bazar-economy"><i class="fas fa-tag"></i> ${economia}% mais barato que o novo</div>
                </div>
                <div class="bazar-actions">
                    <button class="btn-bazar-interest" onclick="demonstrarInteresse(${item.id})">
                        <i class="fab fa-whatsapp"></i> Tenho Interesse
                    </button>
                    <button class="btn-bazar-cart" title="Adicionar ao carrinho" onclick="adicionarBazarAoCarrinho(${item.id})">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/** Retorna nome legível para categorias do bazar (inclui 'outros') */
function nomeDaCategoriaBazar(id) {
    const mapa = {
        eletronicos : 'Eletrônicos',
        casa        : 'Casa e Cozinha',
        ferramentas : 'Ferramentas',
        moda        : 'Moda',
        outros      : 'Outros',
    };
    return mapa[id] || id;
}

/** Filtra e renderiza bazar por categoria */
function filtrarBazar(cat) {
    document.querySelectorAll('.filter-bazar').forEach(b =>
        b.classList.toggle('active', b.dataset.bazarFilter === cat)
    );
    const lista = cat === 'todos'
        ? PRODUTOS_USADOS
        : PRODUTOS_USADOS.filter(p => p.categoria === cat);
    renderBazar(lista);
}

/** Reseta filtros do bazar */
function resetarBazar() {
    filtrarBazar('todos');
}

/** Bind nos botões de filtro do bazar */
function bindFiltrosBazar() {
    document.querySelectorAll('.filter-bazar').forEach(btn => {
        btn.addEventListener('click', () => filtrarBazar(btn.dataset.bazarFilter));
    });
}

/** Abre WhatsApp com mensagem de interesse (simulado) */
function demonstrarInteresse(id) {
    const item = PRODUTOS_USADOS.find(p => p.id === id);
    if (!item) return;
    const msg = encodeURIComponent(
        `Olá! Vi o anúncio "${item.nome}" por ${brl(item.preco)} no Magé Express. Ainda está disponível?`
    );
    // Abre WhatsApp do vendedor (número ficticio)
    window.open(`https://wa.me/5521999990000?text=${msg}`, '_blank', 'noopener,noreferrer');
}

/** Adiciona item do bazar ao carrinho */
function adicionarBazarAoCarrinho(id) {
    const item = PRODUTOS_USADOS.find(p => p.id === id);
    if (!item) return;

    // Reutiliza o mesmo carrinho com uma cópia do item
    const noItem = {
        id         : item.id,
        nome       : item.nome + ' (Usado)',
        preco      : item.preco,
        emoji      : item.emoji,
        quantidade : 1,
    };

    const existente = carrinho.find(i => i.id === id);
    if (existente) {
        existente.quantidade++;
    } else {
        carrinho.push(noItem);
    }

    salvarCarrinho();
    atualizarContadorCarrinho();
    pulsarBotaoCarrinho();
    toast(`"${item.nome}" adicionado ao carrinho!`);
}

/* ─────────────────────────────────────────────
   SERVIÇOS LOCAIS — DADOS
   ───────────────────────────────────────────── */

// Cores da faixa superior por especialidade
const SERVICO_CORES = {
    construcao : '#795548',
    eletrica   : '#f9a825',
    hidraulica : '#0288d1',
    limpeza    : '#00897b',
    tecnologia : '#5c35a8',
    beleza     : '#e91e63',
    outros     : '#607d8b',
};

/* Fotos de exemplo por especialidade (3 por área) */
const FOTOS_ESPECIALIDADE = {
    construcao: [
        { src: 'https://picsum.photos/seed/const-obra/400/220',   alt: 'Obra de alvenaria' },
        { src: 'https://picsum.photos/seed/const-piso/400/220',   alt: 'Assentamento de pisos e revestimentos' },
        { src: 'https://picsum.photos/seed/const-reform/400/220', alt: 'Reforma residencial concluída' },
    ],
    eletrica: [
        { src: 'https://picsum.photos/seed/elec-painel/400/220',  alt: 'Quadro de distribuição elétrica' },
        { src: 'https://picsum.photos/seed/elec-fio/400/220',     alt: 'Instalação de cabeamentos' },
        { src: 'https://picsum.photos/seed/elec-tomada/400/220',  alt: 'Instalação de tomadas e interruptores' },
    ],
    hidraulica: [
        { src: 'https://picsum.photos/seed/hid-cano/400/220',     alt: 'Encanamento de canos' },
        { src: 'https://picsum.photos/seed/hid-banheiro/400/220', alt: 'Instalação de banheiro' },
        { src: 'https://picsum.photos/seed/hid-caixa/400/220',    alt: 'Caixa d\'água instalada' },
    ],
    limpeza: [
        { src: 'https://picsum.photos/seed/clean-sala/400/220',   alt: 'Limpeza de sala' },
        { src: 'https://picsum.photos/seed/clean-kit/400/220',    alt: 'Cozinha higienizada' },
        { src: 'https://picsum.photos/seed/clean-obra/400/220',   alt: 'Limpeza pós-obra' },
    ],
    tecnologia: [
        { src: 'https://picsum.photos/seed/tech-pc/400/220',      alt: 'Manutenção de computador' },
        { src: 'https://picsum.photos/seed/tech-rede/400/220',    alt: 'Instalação de rede Wi-Fi' },
        { src: 'https://picsum.photos/seed/tech-cftv/400/220',    alt: 'Câmeras CFTV instaladas' },
    ],
    beleza: [
        { src: 'https://picsum.photos/seed/beauty-mani/400/220',  alt: 'Manicure e pedicure' },
        { src: 'https://picsum.photos/seed/beauty-cab/400/220',   alt: 'Corte e coloração' },
        { src: 'https://picsum.photos/seed/beauty-unh/400/220',   alt: 'Alongamento de unhas' },
    ],
    outros: [
        { src: 'https://picsum.photos/seed/outros-jard/400/220',  alt: 'Jardim cuidado' },
        { src: 'https://picsum.photos/seed/outros-serv/400/220',  alt: 'Serviço em andamento' },
        { src: 'https://picsum.photos/seed/outros-res/400/220',   alt: 'Resultado final' },
    ],
};

const PROFISSIONAIS = [
    {
        id: 201, nome: 'João Carlos Silva',      especialidade: 'construcao',
        ocupacao: 'Pedreiro & Azulejista',
        avaliacao: 4.8, avaliacoes: 74, verificado: true, disponivel: true,
        desc: 'Especialista em alvenaria, assentamento de pisos, revestimentos e pequenas reformas residenciais.',
        tags: ['Pedreiro', 'Azulejista', 'Reforma', 'Pinturas'],
        horario: 'Seg–Sáb: 07h–17h',
        horario: 'Seg—Sáb: 07h—17h',
        preco: 200, unidade: 'diária',
        telefone: '21999990001',
    },
    {
        id: 202, nome: 'Marcos Andrade',          especialidade: 'eletrica',
        ocupacao: 'Eletricista Residencial',
        avaliacao: 5.0, avaliacoes: 112, verificado: true, disponivel: true,
        desc: 'Instalações elétricas residenciais e comerciais, quadros de distribuição, SPDA e tomadas.',
        tags: ['Elétrica', 'Instalações', 'SPDA', 'Iluminação'],
        horario: 'Seg–Sex: 08h–18h | Sáb: 08h–12h',
        horario: 'Seg—Sex: 08h—18h | Sáb: 08h—12h',
        preco: 120, unidade: 'hora',
        telefone: '21999990002',
    },
    {
        id: 203, nome: 'Roberto Fonseca',          especialidade: 'hidraulica',
        ocupacao: 'Encanador & Hidráulico',
        avaliacao: 4.7, avaliacoes: 89, verificado: true, disponivel: false,
        desc: 'Conserto de vazamentos, instalação de boxes, torneiras, chuveiros e caixas d\'água.',
        tags: ['Encanamento', 'Infiltração', 'Caixa D\'água', 'Box'],
        horario: 'Seg–Sex: 07h–17h',
        horario: 'Seg—Sex: 07h—17h',
        preco: 150, unidade: 'hora',
        telefone: '21999990003',
    },
    {
        id: 204, nome: 'Sandra Oliveira',          especialidade: 'limpeza',
        ocupacao: 'Diarista & Faxineira',
        avaliacao: 4.9, avaliacoes: 203, verificado: true, disponivel: true,
        desc: 'Limpeza residencial completa, pós-obra, escritórios e eventos. Produto de qualidade incluso.',
        tags: ['Limpeza', 'Faxina', 'Pós-obra', 'Escritório'],
        horario: 'Seg–Sáb: 08h–17h',
        horario: 'Seg—Sáb: 08h—17h',
        preco: 180, unidade: 'diária',
        telefone: '21999990004',
    },
    {
        id: 205, nome: 'Felipe Rocha',             especialidade: 'tecnologia',
        ocupacao: 'Técnico de Informática',
        avaliacao: 4.6, avaliacoes: 58, verificado: false, disponivel: true,
        desc: 'Formatação, montagem de PCs, redes Wi-Fi, CFTV, instalação de programas e suporte remoto.',
        tags: ['Informática', 'Redes', 'CFTV', 'Formatação'],
        horario: 'Seg–Sex: 09h–19h | Sáb: 09h–14h',
        horario: 'Seg—Sex: 09h—19h | Sáb: 09h—14h',
        preco: 80, unidade: 'hora',
        telefone: '21999990005',
    },
    {
        id: 206, nome: 'Camila Ferreira',          especialidade: 'beleza',
        ocupacao: 'Manicure & Cabeleireira',
        avaliacao: 4.9, avaliacoes: 347, verificado: true, disponivel: true,
        desc: 'Atendimento em domicílio. Manicure, pedicure, escova, coloração e alongamento de unhas.',
        tags: ['Manicure', 'Pedicure', 'Cabelo', 'Alongamento'],
        horario: 'Seg–Sáb: 09h–20h',
        horario: 'Seg—Sáb: 09h—20h',
        preco: 60, unidade: 'serviço',
        telefone: '21999990006',
    },
    {
        id: 207, nome: 'Antônio Pereira',          especialidade: 'construcao',
        ocupacao: 'Pintor Predial & Residencial',
        avaliacao: 4.5, avaliacoes: 61, verificado: false, disponivel: true,
        desc: 'Pintura interna, externa, textura, grafiato e epóxi para pisos. Acabamento impecável.',
        tags: ['Pintura', 'Textura', 'Grafiato', 'Epóxi'],
        horario: 'Seg–Sáb: 07h–17h',
        horario: 'Seg—Sáb: 07h—17h',
        preco: 180, unidade: 'diária',
        telefone: '21999990007',
    },
    {
        id: 208, nome: 'Tiago Souza',              especialidade: 'construcao',
        ocupacao: 'Marceneiro & Instalador',
        avaliacao: 4.7, avaliacoes: 44, verificado: true, disponivel: false,
        desc: 'Montagem de móveis planejados, portas, janelas, decks e pequenos consertos em madeira.',
        tags: ['Marcenaria', 'Móveis', 'Deck', 'Portas'],
        horario: 'Seg–Sex: 08h–17h',
        horario: 'Seg—Sex: 08h—17h',
        preco: 120, unidade: 'hora',
        telefone: '21999990008',
    },
    {
        id: 209, nome: 'Patrícia Gomes',           especialidade: 'outros',
        ocupacao: 'Cuidadora de Idosos',
        avaliacao: 5.0, avaliacoes: 29, verificado: true, disponivel: true,
        desc: 'Cuidados diurnos e noturnos, acompanhamento médico, higiene pessoal e companhia.',
        tags: ['Cuidadora', 'Idosos', 'Enfermagem', 'Diário/Noturno'],
        bairro: 'Raiz da Serra, Magé', atende: 'Magé e Guapimirim',
        horario: 'Disponível 24h (combinar)',
        preco: 220, unidade: 'diária',
        telefone: '21999990009',
    },
    {
        id: 210, nome: 'Wesley Nascimento',        especialidade: 'outros',
        ocupacao: 'Jardineiro & Paisagista',
        avaliacao: 4.4, avaliacoes: 37, verificado: false, disponivel: true,
        desc: 'Corte de grama, poda de árvores, plantio, paisagismo e manutenção de jardins.',
        tags: ['Jardinagem', 'Paisagismo', 'Poda', 'Manutenção'],
        horario: 'Seg–Sáb: 07h–16h',
        horario: 'Seg—Sáb: 07h—16h',
        preco: 150, unidade: 'diária',
        telefone: '21999990010',
    },
];

/* ─────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────── */
function brl(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Retorna o nome legível de uma categoria pelo id */
function nomeDaCategoria(id) {
    return (CATEGORIAS.find(c => c.id === id) || { nome: id }).nome;
}

/** Gera HTML de estrelas (cheias, meia, vazia) */
function buildEstrelas(nota) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(nota))          html += '<i class="fas fa-star"></i>';
        else if (i - nota < 1 && i > nota) html += '<i class="fas fa-star-half-alt"></i>';
        else                                html += '<i class="far fa-star"></i>';
    }
    return html;
}

