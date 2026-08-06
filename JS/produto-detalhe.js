'use strict';

/* =========================================================
   MEGA DISTRITO — Detalhes do Produto
   Modal estilo Mercado Livre: descrição, especificações,
   avaliações, histórico de preço (gráfico) e sugestões.
   Sem backend: especificações, histórico, ofertas de outras
   lojas e avaliações são gerados de forma determinística
   (mesmo produto sempre mostra os mesmos dados na sessão).
   ========================================================= */

const PD_LOJAS_TERCEIRAS = [
    'Ponto Digital Magé', 'Casa & Estilo', 'Center Ferragens',
    'Comercial Boa Vista', 'Magazine Popular', 'Loja Bom Preço',
];

const PD_AUTORES_REVIEW = [
    'Bruno T.', 'Larissa M.', 'Diego S.', 'Camila V.', 'Rodrigo P.', 'Juliana C.', 'Vinícius A.', 'Priscila N.',
];

const PD_COMENTARIOS_POSITIVOS = [
    'Produto excelente, chegou rápido e bem embalado!',
    'Superou minhas expectativas, recomendo demais.',
    'Ótimo custo-benefício, comprem sem medo.',
    'Qualidade muito boa, entrega dentro do prazo.',
    'Já é a segunda vez que compro, sempre impecável.',
];

const PD_COMENTARIOS_NEUTROS = [
    'Bom produto, mas achei o prazo de entrega um pouco longo.',
    'Atende o que promete, nada excepcional.',
    'Cumpre a função, esperava um pouco mais pelo preço.',
];

const PD_PERGUNTAS_TEMPLATES = [
    { pergunta: 'Esse produto tem garantia?', resposta: 'Tem sim! Garantia de 12 meses direto com a loja.' },
    { pergunta: 'Vocês entregam em toda Magé e região?', resposta: 'Entregamos sim, é só finalizar a compra e informar o endereço.' },
    { pergunta: 'Ainda tem em estoque?', resposta: 'Temos disponível, pode comprar tranquilo.' },
    { pergunta: 'Posso retirar na loja?', resposta: 'Pode sim, é só escolher "Retirar na loja" no fechamento do pedido.' },
    { pergunta: 'Qual o prazo de entrega?', resposta: 'O prazo médio aqui na região é de 1 a 3 dias úteis.' },
    { pergunta: 'Faz troca se eu não gostar?', resposta: 'Fazemos troca em até 7 dias após o recebimento, sem problema.' },
];

let pdProdutoAtualId = -1;
let pdAbaAtiva = 'descricao';
let pdQuantidade = 1;
let pdVarianteAtiva = 1;
let pdFavoritos = new Set();
let pdPerguntasVisiveis = 3;
/** Perguntas feitas pelo usuário nesta sessão, por produto — públicas, ficam visíveis para todo mundo que abrir o produto */
let pdPerguntasExtras = new Map();
/** Ponto do gráfico "fixado" por clique/toque — permanece visível até novo clique */
let pdChartDotFixado = null;

const PD_VARIANTES_ARMAZENAMENTO = [
    { label: '250 GB', extra: 0 },
    { label: '500 GB', extra: 250 },
    { label: '1 TB', extra: 480 },
];

/** Gerador pseudo-aleatório determinístico (mesma seed = mesma sequência) */
function pdCriarRng(seed) {
    let estado = (seed * 9301 + 49297) % 233280;
    return function () {
        estado = (estado * 9301 + 49297) % 233280;
        return estado / 233280;
    };
}

function pdEscolher(lista, rng) {
    return lista[Math.floor(rng() * lista.length)];
}

const PD_ESPECS_POR_CATEGORIA = {
    eletronicos: [
        { label: 'Garantia', valor: '12 meses' },
        { label: 'Voltagem', valor: 'Bivolt' },
        { label: 'Procedência', valor: 'Nacional' },
    ],
    casa: [
        { label: 'Material', valor: 'Alumínio / Aço inox' },
        { label: 'Garantia', valor: '6 meses' },
    ],
    ferramentas: [
        { label: 'Voltagem', valor: '220V' },
        { label: 'Garantia', valor: '12 meses' },
    ],
    moda: [
        { label: 'Material', valor: 'Algodão / Poliéster' },
        { label: 'Tamanhos disponíveis', valor: 'P, M, G, GG' },
    ],
};

/* Principais características — o painel de destaques que fica entre a
   galeria e a caixa de compra. O catálogo não tem esse campo, então os
   itens saem do nome do produto (quando reconhecível) ou da categoria. */
const PD_CARACTERISTICAS_POR_PALAVRA = [
    {
        chaves: ['fone', 'headset', 'headphone'],
        itens: [
            { icone: 'fas fa-wave-square', titulo: 'Cancelamento de Ruído' },
            { icone: 'fas fa-battery-full', titulo: 'Bateria de 40h' },
            { icone: 'fab fa-bluetooth-b', titulo: 'Bluetooth 5.2' },
            { icone: 'fas fa-headphones', titulo: 'Design Ergonômico' },
        ],
    },
    {
        chaves: ['notebook', 'laptop', 'ultrafino'],
        itens: [
            { icone: 'fas fa-microchip', titulo: 'Processador Intel i5' },
            { icone: 'fas fa-hard-drive', titulo: 'SSD de alta velocidade' },
            { icone: 'fas fa-display', titulo: 'Tela antirreflexo' },
            { icone: 'fas fa-battery-three-quarters', titulo: 'Bateria de longa duração' },
        ],
    },
    {
        chaves: ['smartphone', 'celular', 'iphone'],
        itens: [
            { icone: 'fas fa-camera', titulo: 'Câmera de alta resolução' },
            { icone: 'fas fa-battery-full', titulo: 'Bateria para o dia todo' },
            { icone: 'fas fa-signal', titulo: 'Conexão 4G/5G' },
            { icone: 'fas fa-mobile-screen', titulo: 'Tela sem bordas' },
        ],
    },
];

const PD_CARACTERISTICAS_POR_CATEGORIA = {
    eletronicos: [
        { icone: 'fas fa-shield-halved', titulo: 'Garantia de 12 meses' },
        { icone: 'fas fa-plug', titulo: 'Bivolt automático' },
        { icone: 'fas fa-box-open', titulo: 'Produto lacrado' },
        { icone: 'fas fa-bolt', titulo: 'Baixo consumo de energia' },
    ],
    casa: [
        { icone: 'fas fa-utensils', titulo: 'Uso diário na cozinha' },
        { icone: 'fas fa-droplet', titulo: 'Fácil de limpar' },
        { icone: 'fas fa-shield-halved', titulo: 'Garantia de 6 meses' },
        { icone: 'fas fa-recycle', titulo: 'Material durável' },
    ],
    ferramentas: [
        { icone: 'fas fa-screwdriver-wrench', titulo: 'Uso profissional' },
        { icone: 'fas fa-plug', titulo: 'Alimentação 220V' },
        { icone: 'fas fa-hand', titulo: 'Pegada antiderrapante' },
        { icone: 'fas fa-shield-halved', titulo: 'Garantia de 12 meses' },
    ],
    moda: [
        { icone: 'fas fa-shirt', titulo: 'Algodão / Poliéster' },
        { icone: 'fas fa-ruler', titulo: 'Tamanhos do P ao GG' },
        { icone: 'fas fa-soap', titulo: 'Lavável à máquina' },
        { icone: 'fas fa-palette', titulo: 'Cores variadas' },
    ],
};

const PD_CARACTERISTICAS_PADRAO = [
    { icone: 'fas fa-box-open', titulo: 'Produto novo' },
    { icone: 'fas fa-shield-halved', titulo: 'Garantia da loja' },
    { icone: 'fas fa-truck', titulo: 'Entrega em Magé' },
    { icone: 'fas fa-rotate-left', titulo: 'Troca em até 7 dias' },
];

function gerarCaracteristicas(p) {
    const nome = (p.nome || '').toLowerCase();
    const porPalavra = PD_CARACTERISTICAS_POR_PALAVRA.find(g => g.chaves.some(c => nome.includes(c)));
    const itens = porPalavra?.itens || PD_CARACTERISTICAS_POR_CATEGORIA[p.categoria] || PD_CARACTERISTICAS_PADRAO;
    return itens.slice(0, 4);
}

function gerarEspecificacoes(p) {
    const base = [
        { label: 'Modelo', valor: p.nome },
        { label: 'Categoria', valor: nomeDaCategoria(p.categoria) },
    ];
    return [...base, ...(PD_ESPECS_POR_CATEGORIA[p.categoria] || [])];
}

function gerarDescricaoPadrao(p) {
    return `${p.nome} — um dos itens mais procurados na categoria ${nomeDaCategoria(p.categoria).toLowerCase()} do Mega Distrito. Produto novo, com nota média ${p.avaliacao.toFixed(1)} entre ${p.avaliacoes} clientes que já compraram.`;
}

/** Histórico de 6 meses terminando no preço atual (o último ponto é sempre o preço real) */
function gerarHistoricoPrecos(p) {
    const rng = pdCriarRng(p.id * 7);
    const inicio = p.precoAntigo || p.preco * 1.18;
    // "label" (completo, usado no tooltip) + "curto" (eixo do gráfico — precisa
    // caber em telas pequenas sem forçar rolagem horizontal)
    const labels = [
        { label: 'há 5 meses', curto: '5m' },
        { label: 'há 4 meses', curto: '4m' },
        { label: 'há 3 meses', curto: '3m' },
        { label: 'há 2 meses', curto: '2m' },
        { label: 'mês passado', curto: '1m' },
        { label: 'hoje', curto: 'Hoje' },
    ];
    const total = labels.length;
    const hoje = new Date();

    return labels.map(({ label, curto }, i) => {
        const data = new Date(hoje);
        data.setMonth(data.getMonth() - (total - 1 - i));
        const dataFormatada = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

        if (i === total - 1) return { label, curto, data: dataFormatada, preco: p.preco };
        const t = i / (total - 1);
        const base = inicio + (p.preco - inicio) * t;
        const ruido = (rng() - 0.5) * inicio * 0.06;
        const preco = Math.max(p.preco * 0.92, base + ruido);
        return { label, curto, data: dataFormatada, preco: Math.round(preco * 100) / 100 };
    });
}

/** Mesmo produto em 2-3 lojas concorrentes, sempre mais caro que o Mega Distrito */
function gerarOfertasLojas(p) {
    const rng = pdCriarRng(p.id * 13);
    const lojas = [...PD_LOJAS_TERCEIRAS].sort(() => rng() - 0.5).slice(0, 2 + Math.floor(rng() * 2));
    return lojas.map(loja => ({
        loja,
        preco: Math.round(p.preco * (1.05 + rng() * 0.22) * 100) / 100,
    })).sort((a, b) => a.preco - b.preco);
}

function gerarAvaliacoesDemo(p) {
    const rng = pdCriarRng(p.id * 31);
    const quantidade = 3;
    const usados = new Set();
    const avaliacoes = [];

    for (let i = 0; i < quantidade; i += 1) {
        let autor = pdEscolher(PD_AUTORES_REVIEW, rng);
        let tentativas = 0;
        while (usados.has(autor) && tentativas < 10) { autor = pdEscolher(PD_AUTORES_REVIEW, rng); tentativas += 1; }
        usados.add(autor);

        const nota = Math.max(1, Math.min(5, Math.round((p.avaliacao + (rng() - 0.5) * 1.2) * 2) / 2));
        const comentario = nota >= 4.5
            ? pdEscolher(PD_COMENTARIOS_POSITIVOS, rng)
            : pdEscolher(PD_COMENTARIOS_NEUTROS, rng);
        const semanas = 1 + Math.floor(rng() * 10);

        avaliacoes.push({ autor, nota, comentario, data: `há ${semanas} semana${semanas > 1 ? 's' : ''}` });
    }

    return avaliacoes;
}

/** Distribuição de notas (5 a 1 estrelas) somando o total de avaliações do produto */
function gerarDistribuicaoNotas(p) {
    const rng = pdCriarRng(p.id * 41);
    const pesos = [5, 4, 3, 2, 1].map(estrela => {
        const distancia = Math.abs(estrela - p.avaliacao);
        return Math.max(0.02, 1 - distancia / 3) * (0.7 + rng() * 0.6);
    });
    const somaPesos = pesos.reduce((a, b) => a + b, 0);
    const contagens = pesos.map(w => Math.round((w / somaPesos) * p.avaliacoes));
    return [5, 4, 3, 2, 1].map((estrela, i) => ({ estrela, contagem: contagens[i] }));
}

/** Avaliação do vendedor/loja (independente da nota do produto) */
function gerarAvaliacaoVendedor(p) {
    const rng = pdCriarRng(p.id * 53);
    const nota = Math.round((3.8 + rng() * 1.2) * 10) / 10;
    const total = 40 + Math.floor(rng() * 400);
    return { nota: Math.min(5, nota), total };
}

/** Perguntas públicas de outros clientes, já respondidas pelo vendedor (demo determinística) */
function gerarPerguntasDemo(p) {
    const rng = pdCriarRng(p.id * 71);
    const quantidade = 2 + Math.floor(rng() * 2);
    const templatesUsados = new Set();
    const autoresUsados = new Set();
    const perguntas = [];

    for (let i = 0; i < quantidade; i += 1) {
        let tpl = pdEscolher(PD_PERGUNTAS_TEMPLATES, rng);
        let tentativas = 0;
        while (templatesUsados.has(tpl.pergunta) && tentativas < 10) { tpl = pdEscolher(PD_PERGUNTAS_TEMPLATES, rng); tentativas += 1; }
        templatesUsados.add(tpl.pergunta);

        let autor = pdEscolher(PD_AUTORES_REVIEW, rng);
        tentativas = 0;
        while (autoresUsados.has(autor) && tentativas < 10) { autor = pdEscolher(PD_AUTORES_REVIEW, rng); tentativas += 1; }
        autoresUsados.add(autor);

        const semanas = 1 + Math.floor(rng() * 8);
        perguntas.push({
            autor, pergunta: tpl.pergunta, resposta: tpl.resposta, pendente: false,
            data: `há ${semanas} semana${semanas > 1 ? 's' : ''}`,
        });
    }

    return perguntas;
}

/** Perguntas feitas nesta sessão (topo, mais recentes primeiro) + perguntas públicas demo */
function pdListaPerguntas(p) {
    const extras = pdPerguntasExtras.get(p.id) || [];
    return [...extras, ...gerarPerguntasDemo(p)];
}

function buildPerguntasSecaoHTML(p, vendedor) {
    const lista = pdListaPerguntas(p);
    const visiveis = Math.min(pdPerguntasVisiveis, lista.length);

    const itensHTML = lista.slice(0, visiveis).map(q => `
        <article class="pd-pergunta">
            <p class="pd-pergunta-texto"><i class="fas fa-circle-question"></i> <strong>${escapeHtml(q.autor)}</strong> perguntou: <span>"${escapeHtml(q.pergunta)}"</span></p>
            ${q.pendente
                ? `<p class="pd-pergunta-pendente"><i class="fas fa-clock"></i> Aguardando resposta do vendedor</p>`
                : `<p class="pd-pergunta-resposta"><i class="fas fa-store"></i> <strong>${escapeHtml(vendedor?.name || 'Vendedor')}</strong> respondeu: <span>"${escapeHtml(q.resposta)}"</span></p>`}
            <span class="pd-pergunta-data">${q.data}</span>
        </article>
    `).join('');

    return `
        <section class="pd-secao pd-secao-principal" id="pd-sec-perguntas">
            <h4><i class="fas fa-comments"></i> Perguntas e respostas <span class="pd-secao-count">(${lista.length})</span></h4>
            <p class="pd-pergunta-aviso">Pergunte ao vendedor — sua dúvida e a resposta ficam públicas para ajudar outros compradores.</p>
            <form class="pd-pergunta-form" data-action="form-pergunta">
                <input class="pd-pergunta-input" type="text" name="pergunta" placeholder="Ex.: tem garantia? Qual o prazo de entrega?" maxlength="200" required>
                <button class="btn btn-primary pd-pergunta-btn" type="submit"><i class="fas fa-paper-plane"></i> Perguntar</button>
            </form>
            <div class="pd-perguntas-lista">${itensHTML || '<p class="pd-perguntas-vazio">Nenhuma pergunta ainda. Seja o primeiro a perguntar!</p>'}</div>
            ${visiveis < lista.length ? `
            <button class="pd-ver-mais-perguntas" type="button" data-action="ver-mais-perguntas">
                <span>Ver mais perguntas</span> <i class="fas fa-chevron-down"></i>
            </button>` : ''}
        </section>
    `;
}

/** Gráfico de linha simples em SVG (sem dependências externas) */
function buildPriceChartSVG(historico) {
    const largura = 560, altura = 180, padX = 28, padY = 24, padLabel = 16;
    const precos = historico.map(item => item.preco);
    const min = Math.min(...precos);
    const max = Math.max(...precos);
    const range = (max - min) || 1;
    const stepX = (largura - padX * 2) / (historico.length - 1);
    const areaTopo = padY;
    const areaBase = altura - padY - padLabel;

    const pontos = historico.map((item, i) => {
        const x = padX + i * stepX;
        const y = areaTopo + (1 - (item.preco - min) / range) * (areaBase - areaTopo);
        return { x, y, preco: item.preco, label: item.label, curto: item.curto, data: item.data };
    });

    const linha = pontos.map(pt => `${pt.x},${pt.y}`).join(' ');
    const comprimentoLinha = pontos.reduce((acc, pt, i) => i === 0 ? 0 : acc + Math.hypot(pt.x - pontos[i - 1].x, pt.y - pontos[i - 1].y), 0);
    const pontosSVG = pontos.map((pt, i) => `
        <circle cx="${pt.x}" cy="${pt.y}" r="5" fill="#2e7d32" class="pd-chart-dot" style="animation-delay:${0.15 + i * 0.12}s"
            data-preco="${escapeHtml(brl(pt.preco))}" data-label="${escapeHtml(pt.label)}" data-data="${escapeHtml(pt.data)}" tabindex="0" role="button"
            aria-label="${escapeHtml(pt.label)}, ${escapeHtml(pt.data)}: ${escapeHtml(brl(pt.preco))}"></circle>
    `).join('');
    const labelsSVG = pontos.map(pt => `
        <text x="${pt.x}" y="${altura - 4}" class="pd-chart-label" fill="#78909c" text-anchor="middle">${pt.curto}</text>
    `).join('');

    return `
        <svg viewBox="0 0 ${largura} ${altura}" class="pd-chart-svg" role="img" aria-label="Gráfico de histórico de preço">
            <polyline points="${linha}" fill="none" stroke="#2e7d32" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
                class="pd-chart-line" style="stroke-dasharray:${comprimentoLinha};stroke-dashoffset:${comprimentoLinha}" />
            ${pontosSVG}
            ${labelsSVG}
        </svg>
        <div class="pd-chart-tooltip" hidden></div>
    `;
}

function pdBuscarProduto(id) {
    return PRODUTOS.find(p => p.id === id) || null;
}

function gerarVendedor(p) {
    const rng = pdCriarRng(p.id * 19);
    return LOJAS[Math.floor(rng() * LOJAS.length)];
}

const PD_GALERIA_CORES = ['#e3f2fd', '#fff3e0', '#e8f5e9', '#fce4ec'];

/** Simula 3-4 fotos do produto (o catálogo só tem 1 emoji por item) */
function gerarGaleria(p) {
    const rng = pdCriarRng(p.id * 3);
    const total = 3 + Math.floor(rng() * 2);
    return Array.from({ length: total }, (_, i) => ({
        bg: PD_GALERIA_CORES[i % PD_GALERIA_CORES.length],
        indice: i + 1,
        total,
    }));
}

function buildGaleriaHTML(p, slides) {
    return slides.map(s => `
        <div class="pd-gallery-slide" style="background:${s.bg};">
            <div class="pd-gallery-media">
                <span class="pd-gallery-emoji">${p.emoji}</span>
            </div>
        </div>
    `).join('');
}

function buildGaleriaDotsHTML(slides) {
    return slides.map((s, i) => `
        <button class="pd-gallery-dot${i === 0 ? ' active' : ''}" type="button" data-pd-slide="${i}" aria-label="Foto ${s.indice} de ${s.total}"></button>
    `).join('');
}

/** Coluna de miniaturas à esquerda da foto principal (padrão Mercado Livre) */
function buildGaleriaThumbsHTML(p, slides) {
    return slides.map((s, i) => `
        <button class="pd-thumb${i === 0 ? ' active' : ''}" type="button" data-pd-slide="${i}" style="background:${s.bg};" aria-label="Ver foto ${s.indice} de ${s.total}">
            <span class="pd-thumb-emoji">${p.emoji}</span>
        </button>
    `).join('');
}

function buildProdutoDetalheHTML(p) {
    const desconto = p.precoAntigo ? Math.round((1 - p.preco / p.precoAntigo) * 100) : 0;
    const precoAntigoHTML = p.precoAntigo ? `<span class="pd-preco-antigo" style="color:#F20000">${brl(p.precoAntigo)}</span>` : '';
    const descontoHTML = desconto >= 5 ? `<span class="pd-desconto">-${desconto}%</span>` : '';
    const parcelas = Math.min(12, Math.max(1, Math.floor(p.preco / 10)));
    const vlrParcela = brl(p.preco / parcelas);
    const freteHTML = p.preco >= 99 ? `<div class="pd-frete"><i class="fas fa-truck"></i> Frete grátis</div>` : '';

    const especificacoes = gerarEspecificacoes(p);
    const historico = gerarHistoricoPrecos(p);
    const ofertas = gerarOfertasLojas(p);
    const avaliacoesList = gerarAvaliacoesDemo(p);
    const distribuicaoNotas = gerarDistribuicaoNotas(p);
    const avaliacaoVendedor = gerarAvaliacaoVendedor(p);

    const especsHTML = especificacoes.map(e => `
        <div class="pd-spec-row"><span>${e.label}</span><strong>${e.valor}</strong></div>
    `).join('');

    const ofertasHTML = [
        { loja: 'Mercado Express', preco: p.preco, melhor: true },
        ...ofertas.map(o => ({ loja: o.loja, preco: o.preco, melhor: false })),
    ].map(o => `
        <article class="pd-oferta-card${o.melhor ? ' is-melhor' : ''}" ${o.melhor ? '' : `data-action="ver-oferta" data-loja="${o.loja}"`}>
            ${o.melhor ? '<span class="pd-oferta-selo">Melhor preço</span>' : ''}
            <span class="pd-oferta-card-foto">${p.emoji}</span>
            <span class="pd-oferta-card-loja"><i class="fas fa-store"></i> ${o.loja}</span>
            <span class="pd-oferta-card-preco">${brl(o.preco)}</span>
        </article>
    `).join('');

    const reviewsHTML = avaliacoesList.map(r => `
        <div class="pd-review">
            <div class="pd-review-head">
                <strong>${r.autor}</strong>
                <span class="pd-review-nota">${buildEstrelas(r.nota)}</span>
            </div>
            <p>${r.comentario}</p>
            <span class="pd-review-data">${r.data}</span>
        </div>
    `).join('');

    const maiorContagem = Math.max(...distribuicaoNotas.map(d => d.contagem), 1);
    const distribuicaoHTML = distribuicaoNotas.map(d => `
        <div class="pd-rating-bar-row">
            <span class="pd-rating-bar-label">${d.estrela} <i class="fas fa-star"></i></span>
            <div class="pd-rating-bar-track"><div class="pd-rating-bar-fill" style="width:${(d.contagem / maiorContagem) * 100}%"></div></div>
            <span class="pd-rating-bar-count">${d.contagem}</span>
        </div>
    `).join('');

    const galeria = gerarGaleria(p);
    const galeriaHTML = buildGaleriaHTML(p, galeria);
    const galeriaDotsHTML = buildGaleriaDotsHTML(galeria);
    const galeriaThumbsHTML = buildGaleriaThumbsHTML(p, galeria);
    const vendedor = gerarVendedor(p);

    const caracteristicasHTML = gerarCaracteristicas(p).map(c => `
        <li class="pd-caracteristica">
            <span class="pd-caracteristica-icone"><i class="${c.icone}"></i></span>
            <span class="pd-caracteristica-texto">${c.titulo}</span>
        </li>
    `).join('');

    const perguntasHTML = buildPerguntasSecaoHTML(p, vendedor);

    return `
        <div class="pd-layout">
            <div class="pd-gallery">
                ${descontoHTML}
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

            <!-- Bloco 2: principais características + atalhos para as seções detalhadas -->
            <aside class="pd-bloco pd-bloco-caracteristicas">
                <h3 class="pd-caracteristicas-titulo">Principais características</h3>
                <ul class="pd-caracteristicas-lista">${caracteristicasHTML}</ul>
                <nav class="pd-quicknav" aria-label="Ir para seção">
                    <a href="#pd-sec-descricao" class="pd-quicknav-item"><i class="fas fa-align-left"></i> Descrição</a>
                    <a href="#pd-sec-especificacoes" class="pd-quicknav-item"><i class="fas fa-list-ul"></i> Especificações</a>
                    <a href="#pd-sec-avaliacoes" class="pd-quicknav-item"><i class="fas fa-star"></i> Avaliações</a>
                    <a href="#pd-sec-perguntas" class="pd-quicknav-item"><i class="fas fa-comments"></i> Perguntas</a>
                    <a href="#pd-sec-historico" class="pd-quicknav-item"><i class="fas fa-chart-line"></i> Histórico de Preços</a>
                </nav>
            </aside>

            <!-- Bloco 3: informações de compra (nome, preço, frete, adicionar ao carrinho) — fica fixo (sticky) ao rolar -->
            <div class="pd-bloco pd-bloco-compra">
                <button class="pd-favorito${pdFavoritos.has(p.id) ? ' active' : ''}" type="button" data-action="favoritar" data-id="${p.id}" aria-label="Favoritar">
                    <i class="${pdFavoritos.has(p.id) ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <span class="pd-categoria">${nomeDaCategoria(p.categoria)}</span>
                <h2 class="pd-nome">${p.nome}</h2>
                <div class="pd-rating">
                    <span class="pd-rating-stars">${buildEstrelas(p.avaliacao)}</span>
                    <span class="pd-rating-valor">${p.avaliacao.toFixed(1)}</span>
                    <span class="pd-rating-count">(${p.avaliacoes} avaliações)</span>
                </div>
                <div class="pd-precos">
                    ${precoAntigoHTML}
                    <div class="pd-preco-atual">${brl(p.preco + PD_VARIANTES_ARMAZENAMENTO[pdVarianteAtiva].extra)}</div>
                    <div class="pd-parcela">em ${parcelas}x ${vlrParcela} sem juros</div>
                    ${freteHTML}
                </div>

                ${p.categoria === 'eletronicos' ? `
                <div class="pd-variantes">
                    <span class="pd-variantes-label">Armazenamento</span>
                    <div class="pd-variantes-chips">
                        ${PD_VARIANTES_ARMAZENAMENTO.map((v, i) => `
                            <button class="pd-variante-chip${i === pdVarianteAtiva ? ' active' : ''}" type="button" data-action="variante" data-indice="${i}">${v.label}</button>
                        `).join('')}
                    </div>
                </div>` : ''}

                <div class="pd-quantidade-row">
                    <span class="pd-variantes-label">Quantidade</span>
                    <div class="pd-stepper">
                        <button type="button" class="pd-stepper-btn" data-action="qtd-menos" aria-label="Diminuir">−</button>
                        <span class="pd-stepper-valor">${pdQuantidade}</span>
                        <button type="button" class="pd-stepper-btn" data-action="qtd-mais" aria-label="Aumentar">+</button>
                    </div>
                </div>

                <button class="btn btn-primary btn-block" type="button" data-action="adicionar" data-id="${p.id}">
                    <i class="fas fa-cart-plus"></i> Adicionar ao carrinho
                </button>
                <button class="btn btn-outline btn-block" type="button" data-action="comprar-agora" data-id="${p.id}">
                    <i class="fas fa-bolt"></i> Comprar agora
                </button>
            </div>

            <!-- Bloco 4: demais informações (descrição, especificações, avaliações, histórico, outras lojas, similares) -->
            <div class="pd-bloco pd-bloco-info">
                <section class="pd-secao pd-secao-principal" id="pd-sec-descricao">
                    <h4 class="pd-secao-toggle" data-action="toggle-secao"><i class="fas fa-align-left"></i> Descrição <i class="fas fa-chevron-down pd-secao-chevron"></i></h4>
                    <p class="pd-secao-preview" data-action="toggle-secao">${(p.descricao || gerarDescricaoPadrao(p)).slice(0, 90)}… <span>Ver mais</span></p>
                    <p class="pd-descricao pd-secao-content" hidden>${p.descricao || gerarDescricaoPadrao(p)}</p>
                </section>

                <section class="pd-secao pd-secao-principal" id="pd-sec-especificacoes">
                    <h4 class="pd-secao-toggle" data-action="toggle-secao"><i class="fas fa-list-ul"></i> Especificações <i class="fas fa-chevron-down pd-secao-chevron"></i></h4>
                    <p class="pd-secao-preview" data-action="toggle-secao">${especificacoes.length} itens · ${especificacoes.map(e => e.label).join(', ')} <span>Ver mais</span></p>
                    <div class="pd-specs pd-secao-content" hidden>${especsHTML}</div>
                </section>

                ${vendedor ? `
                <div class="pd-secao">
                    <h4><i class="fas fa-store-alt"></i> Vendido por</h4>
                    <article class="pd-vendedor-card">
                        <img class="pd-vendedor-icon" src="${vendedor.icon}" alt="${vendedor.name}">
                        <div class="pd-vendedor-info">
                            <strong class="pd-vendedor-nome">${vendedor.name}</strong>
                            <span class="pd-vendedor-categoria">${vendedor.storeCategory}</span>
                            <span class="pd-vendedor-endereco"><i class="fas fa-location-dot"></i> ${vendedor.address}</span>
                            <span class="pd-vendedor-avaliacao">
                                <span class="pd-rating-stars">${buildEstrelas(avaliacaoVendedor.nota)}</span>
                                <strong>${avaliacaoVendedor.nota.toFixed(1)}</strong>
                                <span class="pd-rating-count">(${avaliacaoVendedor.total} avaliações)</span>
                            </span>
                        </div>
                        <a class="btn btn-outline pd-vendedor-btn" href="HTML/loja.html?id=${vendedor.slug}">Ver mais produtos <i class="fas fa-arrow-right"></i></a>
                    </article>
                </div>` : ''}

                <section class="pd-secao pd-secao-principal" id="pd-sec-avaliacoes">
                    <h4><i class="fas fa-star"></i> Avaliações <span class="pd-secao-count">(${p.avaliacoes})</span></h4>
                    <div class="pd-rating-summary">
                        <div class="pd-rating-summary-nota">
                            <strong>${p.avaliacao.toFixed(1)}</strong>
                            <span class="pd-rating-stars">${buildEstrelas(p.avaliacao)}</span>
                            <span class="pd-rating-count">${p.avaliacoes} avaliações</span>
                        </div>
                        <div class="pd-rating-bars">${distribuicaoHTML}</div>
                    </div>
                    <button class="pd-ver-avaliacoes-btn" type="button" data-action="toggle-avaliacoes">
                        <span>Ver avaliações do produto</span> <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="pd-reviews" hidden>${reviewsHTML}</div>
                </section>

                ${perguntasHTML}

                <section class="pd-secao pd-secao-principal" id="pd-sec-historico">
                    <h4><i class="fas fa-chart-line"></i> Histórico de Preço</h4>
                    <div class="pd-chart-wrap">${buildPriceChartSVG(historico)}</div>
                    <p class="pd-chart-caption">Menor preço dos últimos 6 meses: <strong>${brl(Math.min(...historico.map(h => h.preco)))}</strong></p>
                </section>

                <div class="pd-secao">
                    <h4><i class="fas fa-store"></i> Outras ofertas similares</h4>
                    <div class="pd-ofertas-cards">${ofertasHTML}</div>
                </div>
            </div>
        </div>
    `;
}

function pdIrParaSlide(indice) {
    const track = document.querySelector('.pd-gallery-track');
    if (!track) return;
    track.scrollTo({ left: track.clientWidth * indice, behavior: 'smooth' });
}

/** Atalhos das "Principais características": abre a seção recolhida (se houver) e rola até ela */
function pdIrParaSecao(seletor) {
    const secao = document.querySelector(seletor);
    if (!secao) return;

    const header = secao.querySelector('.pd-secao-toggle');
    const conteudo = secao.querySelector('.pd-secao-content');
    if (conteudo?.hidden) {
        conteudo.hidden = false;
        const preview = secao.querySelector('.pd-secao-preview');
        if (preview) preview.hidden = true;
        header?.classList.add('open');
    }

    const btnAvaliacoes = secao.querySelector('[data-action="toggle-avaliacoes"]');
    const reviews = secao.querySelector('.pd-reviews');
    if (reviews?.hidden) {
        reviews.hidden = false;
        btnAvaliacoes?.classList.add('open');
        const span = btnAvaliacoes?.querySelector('span');
        if (span) span.textContent = 'Ocultar avaliações do produto';
    }

    secao.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function pdReplayChartAnimation() {
    const line = document.querySelector('.pd-chart-line');
    const dots = document.querySelectorAll('.pd-chart-dot');
    if (!line) return;
    [line, ...dots].forEach(el => el.classList.remove('pd-chart-play'));
    requestAnimationFrame(() => requestAnimationFrame(() => {
        [line, ...dots].forEach(el => el.classList.add('pd-chart-play'));
    }));
}

function pdObservarGrafico() {
    const wrap = document.querySelector('.pd-chart-wrap');
    if (!wrap || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) pdReplayChartAnimation(); });
    }, { root: document.querySelector('.pd-layout'), threshold: 0.4 });
    observer.observe(wrap);
}

/** Mostra preço + data do ponto do gráfico (hover, foco ou clique/toque fixado) */
function pdMostrarTooltipGrafico(dot) {
    const wrap = dot.closest('.pd-chart-wrap');
    const tooltip = wrap?.querySelector('.pd-chart-tooltip');
    if (!tooltip) return;

    tooltip.innerHTML = `<strong>${dot.dataset.preco}</strong><span>${dot.dataset.label} · ${dot.dataset.data}</span>`;
    tooltip.hidden = false;

    const wrapRect = wrap.getBoundingClientRect();
    const dotRect = dot.getBoundingClientRect();
    const left = dotRect.left - wrapRect.left + dotRect.width / 2;
    const top = dotRect.top - wrapRect.top;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

/** Esconde o tooltip — a menos que um ponto esteja fixado por clique/toque nesse gráfico */
function pdEsconderTooltipGrafico(wrap) {
    if (pdChartDotFixado && wrap?.contains(pdChartDotFixado)) return;
    const tooltip = wrap?.querySelector('.pd-chart-tooltip');
    if (tooltip) tooltip.hidden = true;
    wrap?.querySelectorAll('.pd-chart-dot.active').forEach(d => d.classList.remove('active'));
}

/** Clique/toque num ponto: fixa o tooltip aberto (clicar de novo no mesmo ponto, ou fora do gráfico, fecha) */
function pdFixarTooltipGrafico(dot) {
    const wrap = dot.closest('.pd-chart-wrap');
    const jaFixado = pdChartDotFixado === dot;

    pdChartDotFixado = null;
    pdEsconderTooltipGrafico(wrap);

    if (jaFixado) return;

    pdChartDotFixado = dot;
    pdMostrarTooltipGrafico(dot);
    wrap.querySelectorAll('.pd-chart-dot').forEach(d => d.classList.toggle('active', d === dot));
}

function abrirDetalheProduto(id) {
    const produto = pdBuscarProduto(id);
    if (!produto) return;

    pdProdutoAtualId = id;
    pdAbaAtiva = 'descricao';
    pdQuantidade = 1;
    pdVarianteAtiva = 1;
    pdPerguntasVisiveis = 3;
    pdChartDotFixado = null;

    document.getElementById('pd-content').innerHTML = buildProdutoDetalheHTML(produto);
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

    pdObservarGrafico();
}

function fecharDetalheProduto() {
    document.getElementById('pd-modal').classList.remove('open');
    if (!document.getElementById('cart-sidebar')?.classList.contains('open')
        && !document.getElementById('app-drawer')?.classList.contains('open')) {
        document.body.style.overflow = '';
    }
    pdProdutoAtualId = -1;
    pdChartDotFixado = null;
}

function pdReRenderCompra() {
    const produto = pdBuscarProduto(pdProdutoAtualId);
    if (!produto) return;
    const atual = document.querySelector('.pd-bloco-compra');
    if (!atual) return;
    const novo = document.createElement('div');
    novo.innerHTML = buildProdutoDetalheHTML(produto);
    atual.replaceWith(novo.querySelector('.pd-bloco-compra'));
}

function pdReRenderPerguntas() {
    const produto = pdBuscarProduto(pdProdutoAtualId);
    if (!produto) return;
    const atual = document.getElementById('pd-sec-perguntas');
    if (!atual) return;
    const vendedor = gerarVendedor(produto);
    const novo = document.createElement('div');
    novo.innerHTML = buildPerguntasSecaoHTML(produto, vendedor);
    atual.replaceWith(novo.querySelector('#pd-sec-perguntas'));
}

function bindProdutoDetalhe() {
    const grid = document.getElementById('products-grid');
    if (grid) {
        grid.addEventListener('click', event => {
            const btnAdd = event.target.closest('.btn-add-cart');
            if (btnAdd) return; // deixa o botão "Adicionar" agir normalmente, sem abrir o modal

            const card = event.target.closest('.product-card[data-id]');
            if (!card) return;
            abrirDetalheProduto(Number(card.dataset.id));
        });
    }

    document.getElementById('pd-close')?.addEventListener('click', fecharDetalheProduto);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') fecharDetalheProduto();
    });

    const content = document.getElementById('pd-content');

    content?.addEventListener('click', event => {
        const dotClicado = event.target.closest('.pd-chart-dot');
        if (dotClicado) {
            pdFixarTooltipGrafico(dotClicado);
            return;
        }
        if (!event.target.closest('.pd-chart-wrap')) {
            pdChartDotFixado = null;
            content.querySelectorAll('.pd-chart-wrap').forEach(pdEsconderTooltipGrafico);
        }

        const atalho = event.target.closest('.pd-quicknav-item');
        if (atalho) {
            event.preventDefault();
            pdIrParaSecao(atalho.getAttribute('href'));
            content.querySelectorAll('.pd-quicknav-item').forEach(item => item.classList.toggle('active', item === atalho));
            return;
        }

        const btnAdicionar = event.target.closest('[data-action="adicionar"]');
        if (btnAdicionar) {
            adicionarAoCarrinho(Number(btnAdicionar.dataset.id), pdQuantidade);
            return;
        }

        const btnComprarAgora = event.target.closest('[data-action="comprar-agora"]');
        if (btnComprarAgora) {
            adicionarAoCarrinho(Number(btnComprarAgora.dataset.id), pdQuantidade);
            toast('Seguindo para o checkout (simulação).');
            return;
        }

        const btnOferta = event.target.closest('[data-action="ver-oferta"]');
        if (btnOferta) {
            toast(`Redirecionando para "${btnOferta.dataset.loja}" (simulação).`);
            return;
        }

        const btnFavoritar = event.target.closest('[data-action="favoritar"]');
        if (btnFavoritar) {
            const id = Number(btnFavoritar.dataset.id);
            if (pdFavoritos.has(id)) pdFavoritos.delete(id); else pdFavoritos.add(id);
            btnFavoritar.classList.toggle('active');
            btnFavoritar.querySelector('i').className = pdFavoritos.has(id) ? 'fas fa-heart' : 'far fa-heart';
            return;
        }

        const chipVariante = event.target.closest('[data-action="variante"]');
        if (chipVariante) {
            pdVarianteAtiva = Number(chipVariante.dataset.indice);
            pdReRenderCompra();
            return;
        }

        const btnQtdMais = event.target.closest('[data-action="qtd-mais"]');
        if (btnQtdMais) { pdQuantidade += 1; pdReRenderCompra(); return; }

        const btnQtdMenos = event.target.closest('[data-action="qtd-menos"]');
        if (btnQtdMenos) { pdQuantidade = Math.max(1, pdQuantidade - 1); pdReRenderCompra(); return; }

        const dot = event.target.closest('.pd-gallery-dot');
        if (dot) {
            content.querySelectorAll('.pd-gallery-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            pdIrParaSlide(Number(dot.dataset.pdSlide));
            return;
        }

        const thumb = event.target.closest('.pd-thumb');
        if (thumb) {
            content.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            pdIrParaSlide(Number(thumb.dataset.pdSlide));
            return;
        }

        const thumbsCima = event.target.closest('[data-action="thumbs-cima"]');
        if (thumbsCima) {
            document.querySelector('.pd-thumbs-track')?.scrollBy({ top: -80, behavior: 'smooth' });
            return;
        }

        const thumbsBaixo = event.target.closest('[data-action="thumbs-baixo"]');
        if (thumbsBaixo) {
            document.querySelector('.pd-thumbs-track')?.scrollBy({ top: 80, behavior: 'smooth' });
            return;
        }

        const secaoToggle = event.target.closest('[data-action="toggle-secao"]');
        if (secaoToggle) {
            const secao = secaoToggle.closest('.pd-secao-principal');
            const conteudo = secao?.querySelector('.pd-secao-content');
            const preview = secao?.querySelector('.pd-secao-preview');
            const header = secao?.querySelector('.pd-secao-toggle');
            if (conteudo) conteudo.hidden = !conteudo.hidden;
            if (preview) preview.hidden = conteudo && !conteudo.hidden;
            header?.classList.toggle('open', conteudo && !conteudo.hidden);
            return;
        }

        const btnVerAvaliacoes = event.target.closest('[data-action="toggle-avaliacoes"]');
        if (btnVerAvaliacoes) {
            const reviews = content.querySelector('.pd-reviews');
            const aberto = !reviews.hidden;
            reviews.hidden = aberto;
            btnVerAvaliacoes.classList.toggle('open', !aberto);
            btnVerAvaliacoes.querySelector('span').textContent = aberto ? 'Ver avaliações do produto' : 'Ocultar avaliações do produto';
            return;
        }

        const btnVerMaisPerguntas = event.target.closest('[data-action="ver-mais-perguntas"]');
        if (btnVerMaisPerguntas) {
            pdPerguntasVisiveis += 3;
            pdReRenderPerguntas();
        }
    });

    content?.addEventListener('mouseover', event => {
        const dot = event.target.closest('.pd-chart-dot');
        if (dot) pdMostrarTooltipGrafico(dot);
    });

    content?.addEventListener('mouseout', event => {
        const dot = event.target.closest('.pd-chart-dot');
        if (!dot || dot.contains(event.relatedTarget)) return;
        const wrap = dot.closest('.pd-chart-wrap');
        if (pdChartDotFixado && wrap?.contains(pdChartDotFixado)) {
            if (dot !== pdChartDotFixado) pdMostrarTooltipGrafico(pdChartDotFixado);
            return;
        }
        pdEsconderTooltipGrafico(wrap);
    });

    content?.addEventListener('focusin', event => {
        const dot = event.target.closest('.pd-chart-dot');
        if (dot) pdMostrarTooltipGrafico(dot);
    });

    content?.addEventListener('focusout', event => {
        const dot = event.target.closest('.pd-chart-dot');
        if (dot) pdEsconderTooltipGrafico(dot.closest('.pd-chart-wrap'));
    });

    content?.addEventListener('submit', event => {
        const form = event.target.closest('[data-action="form-pergunta"]');
        if (!form) return;
        event.preventDefault();

        const input = form.querySelector('.pd-pergunta-input');
        const texto = input.value.trim();
        if (!texto) return;

        const produto = pdBuscarProduto(pdProdutoAtualId);
        if (!produto) return;

        const lista = pdPerguntasExtras.get(produto.id) || [];
        lista.unshift({ autor: 'Você', pergunta: texto, resposta: null, pendente: true, data: 'agora mesmo' });
        pdPerguntasExtras.set(produto.id, lista);
        pdPerguntasVisiveis += 1;

        pdReRenderPerguntas();
        toast('Pergunta enviada! Ela ficará visível para todo mundo assim que o vendedor responder.');
    });
}

document.addEventListener('DOMContentLoaded', bindProdutoDetalhe);
