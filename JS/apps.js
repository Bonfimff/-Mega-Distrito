'use strict';

/* =========================================================
   MAGÉ EXPRESS — Gaveta de Apps
   Dados do catálogo em JS/data/apps-catalogo.js;
   helpers compartilhados em JS/utils.js (carregar antes).
   ========================================================= */

let atalhosApps = carregarAtalhosApps();
let appsBusca = '';
let appsCategoria = 'todas';

function isPaginaAppsSeparada() {
    return window.location.pathname.toLowerCase().includes('/html/apps.html');
}

function notificar(msg) {
    toast(msg);
}

function resolverDestinoApp(destino) {
    if (!isPaginaAppsSeparada()) return destino;
    if (destino.startsWith('#')) return `../index.html${destino}`;
    if (destino.startsWith('HTML/')) return `../${destino}`;
    return destino;
}

function getAppsFiltrados() {
    const busca = normalizar(appsBusca);
    return LOJA_APPS.filter(app => {
        const matchCategoria = appsCategoria === 'todas' || app.categoria === appsCategoria;
        if (!matchCategoria) return false;

        if (!busca) return true;

        const texto = normalizar(`${app.nome} ${app.loja} ${app.desc} ${app.categoria}`);
        return texto.includes(busca);
    });
}

function renderApps(targetGridId = 'apps-grid', noResultsId = 'apps-no-results') {
    const grid = document.getElementById(targetGridId);
    if (!grid) return;

    const lista = getAppsFiltrados();
    const semResultado = document.getElementById(noResultsId);

    if (semResultado) semResultado.style.display = lista.length ? 'none' : 'block';

    grid.innerHTML = lista.map(app => {
        const salvo = atalhosApps.includes(app.id);
        const txtAtalho = salvo ? 'Atalho salvo' : 'Adicionar atalho';

        const isLojaApps = targetGridId === 'apps-store-grid';

        if (isPaginaAppsSeparada() && !isLojaApps) {
            return `
                <article class="app-card app-phone-tile ${salvo ? 'is-pinned' : ''}" data-app-id="${app.id}">
                    <div class="app-icon" style="background:${app.cor};"><i class="${app.icone}"></i></div>
                    <h3 class="app-phone-name">${app.nome}</h3>
                </article>
            `;
        }

        return `
            <article class="app-card" data-app-id="${app.id}">
                <div class="app-card-top">
                    <div class="app-icon" style="background:${app.cor};"><i class="${app.icone}"></i></div>
                    <div class="app-meta">
                        <h3>${app.nome}</h3>
                        <small>${app.loja}</small>
                    </div>
                </div>
                <p class="app-desc">${app.desc}</p>
                <div class="app-card-actions">
                    <button class="btn-app-open" data-action="abrir" data-app-id="${app.id}">
                        <i class="fas fa-arrow-right"></i> Abrir app
                    </button>
                    <button class="btn-app-shortcut ${salvo ? 'saved' : ''}" data-action="atalho" data-app-id="${app.id}">
                        <i class="fas fa-thumbtack"></i> ${txtAtalho}
                    </button>
                </div>
            </article>
        `;
    }).join('');
}

function renderAppsFixados() {
    const grid = document.getElementById('apps-pinned-grid');
    if (!grid) return;

    const fixados = atalhosApps
        .map(id => LOJA_APPS.find(app => app.id === id))
        .filter(Boolean);

    const empty = document.getElementById('apps-pinned-empty');
    if (empty) empty.style.display = fixados.length ? 'none' : 'block';

    const cardsFixados = fixados.map(app => `
        <article class="app-card app-phone-tile is-pinned" data-app-id="${app.id}">
            <div class="app-icon" style="background:${app.cor};"><i class="${app.icone}"></i></div>
            <h3 class="app-phone-name">${app.nome}</h3>
        </article>
    `).join('');

    const cardLoja = `
        <button class="app-store-launch-card" id="open-app-store-card" type="button" aria-label="Abrir loja de aplicativos">
            <span class="store-icon-wrap"><i class="fas fa-store"></i></span>
            <strong>Loja de Apps</strong>
            <small>Ver todos os aplicativos</small>
        </button>
    `;

    grid.innerHTML = `${cardsFixados}${cardLoja}`;
}

function abrirLojaApps() {
    const painel = document.getElementById('apps-store-panel');
    if (!painel) return;
    painel.style.display = 'block';
    renderApps('apps-store-grid', 'apps-store-no-results');
    document.getElementById('apps-search-input')?.focus();
}

function fecharLojaApps() {
    const painel = document.getElementById('apps-store-panel');
    if (!painel) return;
    painel.style.display = 'none';
}

function abrirAppPorId(id) {
    const app = LOJA_APPS.find(a => a.id === id);
    if (!app) return;

    const destino = resolverDestinoApp(app.url || '#');
    if (destino.startsWith('#') && destino.length > 1) {
        const secao = document.querySelector(destino);
        if (secao) {
            secao.scrollIntoView({ behavior: 'smooth' });
            notificar(`Abrindo ${app.nome}.`);
            return;
        }
    }

    if (destino === '#') {
        notificar(`O app "${app.nome}" sera liberado em breve.`);
        return;
    }

    window.location.href = destino;
}

function alternarAtalho(id) {
    if (atalhosApps.includes(id)) {
        atalhosApps = atalhosApps.filter(itemId => itemId !== id);
        notificar('Atalho removido da gaveta de apps.');
    } else {
        atalhosApps.push(id);
        notificar('Atalho adicionado na gaveta de apps.');
    }

    salvarAtalhosApps();
    atualizarContadorAtalhos();
    renderApps();
    renderApps('apps-store-grid', 'apps-store-no-results');
    renderAppsFixados();
}

function renderGavetaApps() {
    const container = document.getElementById('app-drawer-content');
    if (!container) return;

    if (atalhosApps.length === 0) {
        container.innerHTML = `
            <div class="app-drawer-empty">
                <i class="fas fa-mobile-alt"></i>
                <p>Sua gaveta esta vazia.</p>
                <small>Adicione atalhos na secao Apps das Lojas.</small>
            </div>
        `;
        return;
    }

    const atalhos = atalhosApps
        .map(id => LOJA_APPS.find(app => app.id === id))
        .filter(Boolean);

    container.innerHTML = atalhos.map(app => `
        <div class="app-shortcut-item" data-app-id="${app.id}">
            <div class="app-icon" style="background:${app.cor};"><i class="${app.icone}"></i></div>
            <div>
                <div class="app-shortcut-name">${app.nome}</div>
                <div class="app-shortcut-store">${app.loja}</div>
            </div>
            <div class="app-shortcut-actions">
                <button class="app-mini-btn open" data-action="abrir" data-app-id="${app.id}" title="Abrir">
                    <i class="fas fa-arrow-up-right-from-square"></i>
                </button>
                <button class="app-mini-btn remove" data-action="remover" data-app-id="${app.id}" title="Remover atalho">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function atualizarContadorAtalhos() {
    const el = document.getElementById('app-drawer-count');
    if (!el) return;
    el.textContent = atalhosApps.length;
}

function abrirGavetaApps() {
    const drawer = document.getElementById('app-drawer');
    const overlay = document.getElementById('app-overlay');
    if (!drawer || !overlay) return;

    if (typeof fecharCarrinho === 'function') fecharCarrinho();
    drawer.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderGavetaApps();
}

function fecharGavetaApps() {
    const drawer = document.getElementById('app-drawer');
    const overlay = document.getElementById('app-overlay');
    if (!drawer || !overlay) return;

    drawer.classList.remove('open');
    overlay.classList.remove('active');
    if (!document.getElementById('cart-sidebar')?.classList.contains('open')) {
        document.body.style.overflow = '';
    }
}

function salvarAtalhosApps() {
    try {
        localStorage.setItem('mage-app-atalhos', JSON.stringify(atalhosApps));
    } catch {
        // localStorage indisponivel
    }
}

function carregarAtalhosApps() {
    try {
        const dados = JSON.parse(localStorage.getItem('mage-app-atalhos')) || [];
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function bindApps() {
    const grid = document.getElementById('apps-grid');
    const gridFixados = document.getElementById('apps-pinned-grid');
    const gridLoja = document.getElementById('apps-store-grid');
    const btnGaveta = document.getElementById('app-drawer-btn');
    const btnFecharGaveta = document.getElementById('close-app-drawer');
    const overlayApps = document.getElementById('app-overlay');
    const drawerContent = document.getElementById('app-drawer-content');
    const openStoreBtn = document.getElementById('open-app-store-btn');
    const closeStoreBtn = document.getElementById('close-app-store-btn');

    if (grid) {
        grid.addEventListener('click', e => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;

            const id = Number(btn.dataset.appId);
            if (!id) return;

            if (btn.dataset.action === 'abrir') abrirAppPorId(id);
            if (btn.dataset.action === 'atalho') alternarAtalho(id);
        });
    }

    if (gridFixados) {
        gridFixados.addEventListener('click', e => {
            const launch = e.target.closest('#open-app-store-card');
            if (launch) {
                abrirLojaApps();
                return;
            }

            const tile = e.target.closest('.app-card[data-app-id]');
            if (tile) {
                const id = Number(tile.dataset.appId);
                if (id) abrirAppPorId(id);
                return;
            }

            const btn = e.target.closest('button[data-action]');
            if (!btn) return;

            const id = Number(btn.dataset.appId);
            if (!id) return;

            if (btn.dataset.action === 'abrir') abrirAppPorId(id);
            if (btn.dataset.action === 'atalho') alternarAtalho(id);
        });
    }

    if (gridLoja) {
        gridLoja.addEventListener('click', e => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;

            const id = Number(btn.dataset.appId);
            if (!id) return;

            if (btn.dataset.action === 'abrir') abrirAppPorId(id);
            if (btn.dataset.action === 'atalho') alternarAtalho(id);
        });
    }

    if (drawerContent) {
        drawerContent.addEventListener('click', e => {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;

            const id = Number(btn.dataset.appId);
            if (!id) return;

            if (btn.dataset.action === 'abrir') abrirAppPorId(id);
            if (btn.dataset.action === 'remover') alternarAtalho(id);
        });
    }

    if (btnGaveta && btnGaveta.tagName === 'BUTTON') btnGaveta.addEventListener('click', abrirGavetaApps);
    if (btnFecharGaveta) btnFecharGaveta.addEventListener('click', fecharGavetaApps);
    if (overlayApps) overlayApps.addEventListener('click', fecharGavetaApps);
    if (openStoreBtn) openStoreBtn.addEventListener('click', abrirLojaApps);
    if (closeStoreBtn) closeStoreBtn.addEventListener('click', fecharLojaApps);
}

function bindBuscaApps() {
    const input = document.getElementById('apps-search-input');
    const select = document.getElementById('apps-category-filter');
    const chips = Array.from(document.querySelectorAll('.app-cat-chip'));

    const setCategoriaUI = categoria => {
        if (select) select.value = categoria;
        chips.forEach(chip => chip.classList.toggle('active', chip.dataset.appCat === categoria));
    };

    if (input) {
        input.addEventListener('input', () => {
            appsBusca = input.value.trim();
            renderApps('apps-store-grid', 'apps-store-no-results');
        });
    }

    if (select) {
        select.addEventListener('change', () => {
            appsCategoria = select.value;
            setCategoriaUI(appsCategoria);
            renderApps('apps-store-grid', 'apps-store-no-results');
        });
    }

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            appsCategoria = chip.dataset.appCat || 'todas';
            setCategoriaUI(appsCategoria);
            renderApps('apps-store-grid', 'apps-store-no-results');
        });
    });
}

function bindFloatingBottomNav() {
    const nav = document.getElementById('floating-bottom-nav');
    if (!nav) return;

    const itens = Array.from(nav.querySelectorAll('.floating-nav-item'));
    const secoes = ['inicio', 'apps'];

    function setAtivo(nome) {
        itens.forEach(item => item.classList.toggle('active', item.dataset.navItem === nome));
    }

    itens.forEach(item => {
        item.addEventListener('click', e => {
            const nome = item.dataset.navItem;

            const href = item.getAttribute('href');
            if (!href) return;

            setAtivo(nome);
            if (href.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const observer = new IntersectionObserver(entries => {
        let ativo = 'inicio';
        entries.forEach(entry => {
            if (entry.isIntersecting) ativo = entry.target.id;
        });
        if (!document.getElementById('app-drawer')?.classList.contains('open') && secoes.includes(ativo)) {
            setAtivo(ativo);
        }
    }, { threshold: 0.45, rootMargin: '-120px 0px -120px 0px' });

    secoes.forEach(id => {
        const secao = document.getElementById(id);
        if (secao) observer.observe(secao);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('apps-grid')) renderApps();
    if (document.getElementById('apps-pinned-grid')) renderAppsFixados();
    atualizarContadorAtalhos();
    renderGavetaApps();
    bindApps();
    bindBuscaApps();
    bindFloatingBottomNav();
});
