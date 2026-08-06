'use strict';

/* =========================================================
   MEGA DISTRITO — Detalhes do Item do Bazar
   Reaproveita o mesmo modal do produto novo (produto-detalhe.js
   define #pd-modal/#pd-content e os handlers genéricos de galeria,
   "ver mais"/toggle de seção e atalhos do quicknav — tudo isso
   funciona aqui sem alterações).
   Só o que faz sentido para um item usado e único fica na tela:
   sem variantes de armazenamento, sem seletor de quantidade, sem
   "outras ofertas"/histórico de preço (não existem para um item
   único) e sem avaliações do produto (o bazar não tem notas).
   ========================================================= */

let pdbAtualId = -1;
let pdbFavoritos = new Set();
let pdbPerguntasVisiveis = 3;
/** Perguntas feitas nesta sessão, por item do bazar — públicas, ficam visíveis para todo mundo */
let pdbPerguntasExtras = new Map();

const PDB_PERGUNTAS_TEMPLATES = [
    { pergunta: 'Ainda está disponível?', resposta: 'Sim, ainda está disponível!' },
    { pergunta: 'Aceita entrega ou é só retirada?', resposta: 'Posso entregar aqui perto, combinamos por aqui mesmo.' },
    { pergunta: 'Tem nota fiscal ou caixa original?', resposta: 'Não tenho mais a caixa, mas está tudo funcionando certinho.' },
    { pergunta: 'Aceita negociar o preço?', resposta: 'Dá pra conversar um pouco, me chama no chat.' },
    { pergunta: 'Qual o motivo da venda?', resposta: 'Não uso mais, prefiro repassar pra quem precisa.' },
];

function pdbBuscarItem(id) {
    return PRODUTOS_USADOS.find(p => p.id === id) || null;
}

/** Hash simples e determinístico de string (usado pra "seedar" a reputação do vendedor a partir do nome) */
function pdbHashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
}

/** Reputação do vendedor (vendas anteriores + nota, se houver) — demo determinística
 *  a partir do nome, então o mesmo vendedor mantém a mesma reputação em todos os anúncios dele. */
function pdbGerarReputacaoVendedor(item) {
    const rng = pdCriarRng((pdbHashString(item.vendedor || 'vendedor') % 100000) + 1);
    const vendas = Math.floor(rng() * 40);
    if (vendas === 0) return { vendas: 0, temAvaliacao: false };

    const nota = Math.min(5, Math.round((3.5 + rng() * 1.5) * 10) / 10);
    const totalAvaliacoes = Math.max(1, Math.round(vendas * (0.5 + rng() * 0.4)));
    return { vendas, temAvaliacao: true, nota, totalAvaliacoes };
}

/** Perguntas públicas de outros interessados, já respondidas pelo vendedor (demo determinística) */
function pdbGerarPerguntasDemo(item) {
    const rng = pdCriarRng(item.id * 97);
    const quantidade = 1 + Math.floor(rng() * 2);
    const templatesUsados = new Set();
    const autoresUsados = new Set();
    const perguntas = [];

    for (let i = 0; i < quantidade; i += 1) {
        let tpl = pdEscolher(PDB_PERGUNTAS_TEMPLATES, rng);
        let tentativas = 0;
        while (templatesUsados.has(tpl.pergunta) && tentativas < 10) { tpl = pdEscolher(PDB_PERGUNTAS_TEMPLATES, rng); tentativas += 1; }
        templatesUsados.add(tpl.pergunta);

        let autor = pdEscolher(PD_AUTORES_REVIEW, rng);
        tentativas = 0;
        while (autoresUsados.has(autor) && tentativas < 10) { autor = pdEscolher(PD_AUTORES_REVIEW, rng); tentativas += 1; }
        autoresUsados.add(autor);

        const dias = 1 + Math.floor(rng() * 12);
        perguntas.push({
            autor, pergunta: tpl.pergunta, resposta: tpl.resposta, pendente: false,
            data: `há ${dias} dia${dias > 1 ? 's' : ''}`,
        });
    }

    return perguntas;
}

/** Perguntas feitas nesta sessão (topo, mais recentes primeiro) + perguntas públicas demo */
function pdbListaPerguntas(item) {
    const extras = pdbPerguntasExtras.get(item.id) || [];
    return [...extras, ...pdbGerarPerguntasDemo(item)];
}

function buildBazarPerguntasSecaoHTML(item) {
    const lista = pdbListaPerguntas(item);
    const visiveis = Math.min(pdbPerguntasVisiveis, lista.length);

    const itensHTML = lista.slice(0, visiveis).map(q => `
        <article class="pd-pergunta">
            <p class="pd-pergunta-texto"><i class="fas fa-circle-question"></i> <strong>${escapeHtml(q.autor)}</strong> perguntou: <span>"${escapeHtml(q.pergunta)}"</span></p>
            ${q.pendente
                ? `<p class="pd-pergunta-pendente"><i class="fas fa-clock"></i> Aguardando resposta do vendedor</p>`
                : `<p class="pd-pergunta-resposta"><i class="fas fa-user"></i> <strong>${escapeHtml(item.vendedor)}</strong> respondeu: <span>"${escapeHtml(q.resposta)}"</span></p>`}
            <span class="pd-pergunta-data">${q.data}</span>
        </article>
    `).join('');

    return `
        <section class="pd-secao pd-secao-principal" id="pdb-sec-perguntas">
            <h4><i class="fas fa-comments"></i> Perguntas e respostas <span class="pd-secao-count">(${lista.length})</span></h4>
            <p class="pd-pergunta-aviso">Pergunte ao vendedor — sua dúvida e a resposta ficam públicas para ajudar outros interessados.</p>
            <form class="pd-pergunta-form" data-action="form-pergunta-bazar">
                <input class="pd-pergunta-input" type="text" name="pergunta" placeholder="Ex.: ainda está disponível? aceita entrega?" maxlength="200" required>
                <button class="btn btn-primary pd-pergunta-btn" type="submit"><i class="fas fa-paper-plane"></i> Perguntar</button>
            </form>
            <div class="pd-perguntas-lista">${itensHTML || '<p class="pd-perguntas-vazio">Nenhuma pergunta ainda. Seja o primeiro a perguntar!</p>'}</div>
            ${visiveis < lista.length ? `
            <button class="pd-ver-mais-perguntas" type="button" data-action="ver-mais-perguntas-bazar">
                <span>Ver mais perguntas</span> <i class="fas fa-chevron-down"></i>
            </button>` : ''}
        </section>
    `;
}

function buildBazarDetalheHTML(item) {
    const condCls = { otimo: 'cond-otimo', bom: 'cond-bom', regular: 'cond-regular' }[item.condicao] || 'cond-bom';
    const economia = Math.round((1 - item.preco / item.precoOrig) * 100);
    const economiaHTML = economia > 0
        ? `<div class="bazar-economy"><i class="fas fa-tag"></i> ${economia}% mais barato que o novo</div>`
        : '';
    const inicial = (item.vendedor || '?').charAt(0).toUpperCase();
    const descricao = item.desc || `${item.nome}, ${item.condicaoLabel.toLowerCase()}, vendido por ${item.vendedor}.`;
    const reputacao = pdbGerarReputacaoVendedor(item);
    const reputacaoVendasHTML = reputacao.vendas > 0
        ? `<span class="pdb-seller-reputacao"><i class="fas fa-circle-check"></i> ${reputacao.vendas} produto${reputacao.vendas > 1 ? 's' : ''} vendido${reputacao.vendas > 1 ? 's' : ''}</span>`
        : `<span class="pdb-seller-reputacao pdb-seller-novo"><i class="fas fa-seedling"></i> Novo no bazar</span>`;
    const reputacaoAvaliacaoHTML = reputacao.temAvaliacao ? `
        <span class="pdb-seller-avaliacao">
            <span class="pd-rating-stars">${buildEstrelas(reputacao.nota)}</span>
            <strong>${reputacao.nota.toFixed(1)}</strong>
            <span class="pd-rating-count">(${reputacao.totalAvaliacoes} avaliações)</span>
        </span>` : '';

    const galeria = gerarGaleria(item);
    const galeriaHTML = buildGaleriaHTML(item, galeria);
    const galeriaDotsHTML = buildGaleriaDotsHTML(galeria);
    const galeriaThumbsHTML = buildGaleriaThumbsHTML(item, galeria);

    const perguntasHTML = buildBazarPerguntasSecaoHTML(item);

    return `
        <div class="pd-layout">
            <div class="pd-gallery">
                <span class="pdb-condicao ${condCls}"><i class="fas fa-recycle"></i> ${item.condicaoLabel}</span>
                <div class="pd-gallery-body">
                    <div class="pd-gallery-thumbs">
                        <button class="pd-thumbs-nav pd-thumbs-nav-up" type="button" data-action="thumbs-cima" aria-label="Miniaturas anteriores"><i class="fas fa-chevron-up"></i></button>
                        <div class="pd-thumbs-track">${galeriaThumbsHTML}</div>
                        <button class="pd-thumbs-nav pd-thumbs-nav-down" type="button" data-action="thumbs-baixo" aria-label="Próximas miniaturas"><i class="fas fa-chevron-down"></i></button>
                    </div>
                    <div class="pd-gallery-square">
                        <div class="pd-gallery-track">${galeriaHTML}</div>
                    </div>
                </div>
                <div class="pd-gallery-dots">${galeriaDotsHTML}</div>
            </div>

            <!-- Detalhes do item: condição, categoria, local e anunciante — substitui as
                 "Principais características" (que não fazem sentido pra um item único usado) -->
            <aside class="pd-bloco pd-bloco-caracteristicas">
                <h3 class="pd-caracteristicas-titulo">Detalhes do item</h3>
                <ul class="pd-caracteristicas-lista">
                    <li class="pd-caracteristica">
                        <span class="pd-caracteristica-icone"><i class="fas fa-recycle"></i></span>
                        <span class="pd-caracteristica-texto">${item.condicaoLabel}</span>
                    </li>
                    <li class="pd-caracteristica">
                        <span class="pd-caracteristica-icone"><i class="fas fa-tag"></i></span>
                        <span class="pd-caracteristica-texto">${nomeDaCategoriaBazar(item.categoria)}</span>
                    </li>
                    <li class="pd-caracteristica">
                        <span class="pd-caracteristica-icone"><i class="fas fa-location-dot"></i></span>
                        <span class="pd-caracteristica-texto">${item.bairro || 'Magé'}</span>
                    </li>
                    <li class="pd-caracteristica">
                        <span class="pd-caracteristica-icone"><i class="fas fa-user"></i></span>
                        <span class="pd-caracteristica-texto">Anunciado por ${item.vendedor}</span>
                    </li>
                </ul>
                <nav class="pd-quicknav" aria-label="Ir para seção">
                    <a href="#pdb-sec-descricao" class="pd-quicknav-item"><i class="fas fa-align-left"></i> Descrição</a>
                    <a href="#pdb-sec-perguntas" class="pd-quicknav-item"><i class="fas fa-comments"></i> Perguntas</a>
                </nav>
            </aside>

            <!-- Compra: sem variantes de armazenamento nem seletor de quantidade — é uma
                 peça única. "Comprar agora" vira "Tenho interesse" (fluxo real do bazar,
                 pelo chat da própria plataforma). -->
            <div class="pd-bloco pd-bloco-compra">
                <button class="pd-favorito${pdbFavoritos.has(item.id) ? ' active' : ''}" type="button" data-action="favoritar-bazar" data-id="${item.id}" aria-label="Favoritar">
                    <i class="${pdbFavoritos.has(item.id) ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <span class="pd-categoria">${nomeDaCategoriaBazar(item.categoria)}</span>
                <h2 class="pd-nome">${item.nome}</h2>

                <div class="pd-precos">
                    <span class="bazar-price-orig">Novo por: ${brl(item.precoOrig)}</span>
                    <div class="pd-preco-atual">${brl(item.preco)}</div>
                    ${economiaHTML}
                </div>

                <div class="bazar-seller pdb-seller">
                    <div class="bazar-seller-avatar">${inicial}</div>
                    <div class="bazar-seller-info">
                        <span class="bazar-seller-name">${item.vendedor}</span>
                        <span class="bazar-seller-local"><i class="fas fa-map-marker-alt"></i> ${item.bairro || 'Magé'}</span>
                        ${reputacaoVendasHTML}
                        ${reputacaoAvaliacaoHTML}
                    </div>
                </div>

                <button class="btn btn-primary btn-block" type="button" onclick="demonstrarInteresse(${item.id})">
                    <i class="fas fa-comment-dots"></i> Tenho interesse
                </button>
                <button class="btn btn-outline btn-block" type="button" onclick="adicionarBazarAoCarrinho(${item.id})">
                    <i class="fas fa-cart-plus"></i> Adicionar ao carrinho
                </button>
            </div>

            <!-- Sem especificações genéricas, avaliações, histórico de preço ou "outras ofertas":
                 nenhum desses faz sentido pra uma peça usada única, sem garantia de fábrica
                 e vendida por uma só pessoa. -->
            <div class="pd-bloco pd-bloco-info">
                <section class="pd-secao pd-secao-principal" id="pdb-sec-descricao">
                    <h4 class="pd-secao-toggle" data-action="toggle-secao"><i class="fas fa-align-left"></i> Descrição <i class="fas fa-chevron-down pd-secao-chevron"></i></h4>
                    <p class="pd-secao-preview" data-action="toggle-secao">${descricao.slice(0, 90)}… <span>Ver mais</span></p>
                    <p class="pd-descricao pd-secao-content" hidden>${descricao}</p>
                </section>

                ${perguntasHTML}
            </div>
        </div>
    `;
}

function abrirDetalheBazar(id) {
    const item = pdbBuscarItem(id);
    if (!item) return;

    pdbAtualId = id;
    pdbPerguntasVisiveis = 3;

    document.getElementById('pd-content').innerHTML = buildBazarDetalheHTML(item);
    document.getElementById('pd-modal').classList.add('open');
    document.body.style.overflow = 'hidden';

    document.getElementById('pd-modal').scrollTo(0, 0);
    document.querySelector('.pd-gallery-track')?.scrollTo(0, 0);
    document.querySelector('.pd-layout')?.scrollTo(0, 0);

    const track = document.querySelector('.pd-gallery-track');
    track?.addEventListener('scroll', () => {
        const indice = Math.round(track.scrollLeft / track.clientWidth);
        document.querySelectorAll('.pd-gallery-dot').forEach((dot, i) => dot.classList.toggle('active', i === indice));
        document.querySelectorAll('.pd-thumb').forEach((thumb, i) => thumb.classList.toggle('active', i === indice));
    });
}

function pdbReRenderPerguntas() {
    const item = pdbBuscarItem(pdbAtualId);
    if (!item) return;
    const atual = document.getElementById('pdb-sec-perguntas');
    if (!atual) return;
    const novo = document.createElement('div');
    novo.innerHTML = buildBazarPerguntasSecaoHTML(item);
    atual.replaceWith(novo.querySelector('#pdb-sec-perguntas'));
}

function bindBazarDetalhe() {
    const grid = document.getElementById('bazar-grid');
    if (grid) {
        grid.addEventListener('click', event => {
            if (event.target.closest('button')) return; // deixa "Tenho Interesse"/carrinho agirem normalmente, sem abrir o modal

            const card = event.target.closest('.bazar-card[data-id]');
            if (!card) return;
            abrirDetalheBazar(Number(card.dataset.id));
        });
    }

    const content = document.getElementById('pd-content');

    content?.addEventListener('click', event => {
        const btnFavoritar = event.target.closest('[data-action="favoritar-bazar"]');
        if (btnFavoritar) {
            const id = Number(btnFavoritar.dataset.id);
            if (pdbFavoritos.has(id)) pdbFavoritos.delete(id); else pdbFavoritos.add(id);
            btnFavoritar.classList.toggle('active');
            btnFavoritar.querySelector('i').className = pdbFavoritos.has(id) ? 'fas fa-heart' : 'far fa-heart';
            return;
        }

        const btnVerMaisPerguntas = event.target.closest('[data-action="ver-mais-perguntas-bazar"]');
        if (btnVerMaisPerguntas) {
            pdbPerguntasVisiveis += 3;
            pdbReRenderPerguntas();
        }
    });

    content?.addEventListener('submit', event => {
        const form = event.target.closest('[data-action="form-pergunta-bazar"]');
        if (!form) return;
        event.preventDefault();

        const input = form.querySelector('.pd-pergunta-input');
        const texto = input.value.trim();
        if (!texto) return;

        const item = pdbBuscarItem(pdbAtualId);
        if (!item) return;

        const lista = pdbPerguntasExtras.get(item.id) || [];
        lista.unshift({ autor: 'Você', pergunta: texto, resposta: null, pendente: true, data: 'agora mesmo' });
        pdbPerguntasExtras.set(item.id, lista);
        pdbPerguntasVisiveis += 1;

        pdbReRenderPerguntas();
        toast('Pergunta enviada! Ela ficará visível para todo mundo assim que o vendedor responder.');
    });
}

document.addEventListener('DOMContentLoaded', bindBazarDetalhe);
