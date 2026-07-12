'use strict';
/* =========================================================
   MAGÉ EXPRESS - SERVIÇOS
   Renderização de profissionais, vagas e currículo
   ========================================================= */
function renderServicos(lista) {
    const grid     = document.getElementById('servicos-grid');
    const msgVazia = document.getElementById('servicos-no-results');

    if (lista.length === 0) {
        grid.innerHTML = '';
        msgVazia.style.display = 'block';
        return;
    }

    msgVazia.style.display = 'none';
    grid.innerHTML = lista.map(buildServicoCardHTML).join('');

    // Animação em cascata
    grid.querySelectorAll('.servico-card').forEach((card, i) => {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity .4s ease, transform .4s ease';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
        }, i * 65);
    });

    // Inicia carrossel de fotos após renderização
    iniciarGalerias();
}

function buildServicoCardHTML(p) {
    const cor          = SERVICO_CORES[p.especialidade] || '#607d8b';
    const inicial      = p.nome.charAt(0).toUpperCase();
    const estrelas     = buildEstrelas(p.avaliacao);
    const dispCls      = p.disponivel ? 'disponivel-sim' : 'disponivel-nao';
    const dispTitle    = p.disponivel ? 'Disponível agora' : 'Indisponível no momento';

    // Galeria de fotos
    const fotos = p.fotos || FOTOS_ESPECIALIDADE[p.especialidade] || [];
    const slidesHTML = fotos.map(f =>
        `<img class="galeria-slide" src="${f.src}" alt="${f.alt}" loading="lazy">`
    ).join('');
    const dotsHTML = fotos.map((_, i) =>
        `<button class="galeria-dot${i === 0 ? ' active' : ''}" onclick="galeriaIrDot(this,${i})" aria-label="Foto ${i + 1}"></button>`
    ).join('');
    const galeriaHTML = fotos.length > 0
        ? `<div class="servico-galeria" data-gal-atual="0">
               <div class="galeria-track">${slidesHTML}</div>
               <button class="galeria-btn galeria-prev" onclick="galeriaNavBtn(this,-1)" aria-label="Foto anterior">&#8249;</button>
               <button class="galeria-btn galeria-next" onclick="galeriaNavBtn(this,1)" aria-label="Próxima foto">&#8250;</button>
               <div class="galeria-dots">${dotsHTML}</div>
               <div class="galeria-stripe" style="background:${cor};"></div>
           </div>`
        : `<div class="servico-card-header" style="background:${cor};"></div>`;
    const verificBadge = p.verificado
        ? `<span class="servico-verificado"><i class="fas fa-check-circle"></i> Verificado</span>`
        : '';
    const tags = p.tags.map(t => `<span class="servico-tag">${t}</span>`).join('');

    return `
        <div class="servico-card">
            ${galeriaHTML}
            <span class="servico-disponivel ${dispCls}" title="${dispTitle}"></span>
            <div class="servico-card-body">
                <div class="servico-perfil">
                    <div class="servico-avatar" style="background:${cor};">${inicial}</div>
                    <div class="servico-perfil-info">
                        <div class="servico-nome">${p.nome}</div>
                        <div class="servico-ocupacao">${p.ocupacao}</div>
                        <div class="servico-rating">
                            <span class="stars">${estrelas}</span>
                            <span class="count">${p.avaliacao.toFixed(1)} (${p.avaliacoes} avaliações)</span>
                        </div>
                    </div>
                </div>
                ${verificBadge}
                <p class="servico-desc">${p.desc}</p>
                <div class="servico-tags">${tags}</div>
                <div class="servico-meta">
                    <div class="servico-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span><strong>${p.bairro}</strong> · Atende: ${p.atende}</span>
                    </div>
                    <div class="servico-meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${p.horario}</span>
                    </div>
                </div>
                <div class="servico-preco">
                    <div class="servico-preco-label">A partir de</div>
                    <div class="servico-preco-valor">
                        ${brl(p.preco)} <span>/ ${p.unidade}</span>
                    </div>
                </div>
                <div class="servico-actions">
                    <button class="btn-servico-contato" onclick="contatarProfissional(${p.id})">
                        <i class="fas fa-phone-alt"></i> Solicitar Serviço
                    </button>
                    <button class="btn-servico-wpp" title="WhatsApp" onclick="wppProfissional(${p.id})">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

const _galeriaTimers = new Map();

/** Inicia (ou reinicia) os carrosseis após renderizar os cards */
function iniciarGalerias() {
    // Limpa timers anteriores para evitar acúmulo ao filtrar
    _galeriaTimers.forEach(id => clearInterval(id));
    _galeriaTimers.clear();

    document.querySelectorAll('.servico-galeria').forEach(galeria => {
        const total = galeria.querySelectorAll('.galeria-slide').length;
        if (total <= 1) return;

        const timer = setInterval(() => {
            const atual = parseInt(galeria.dataset.galAtual || '0');
            _galeriaIr(galeria, (atual + 1) % total);
        }, 3500);

        _galeriaTimers.set(galeria, timer);
    });
}

/** Avança/retrocede pelo botão de seta */
function galeriaNavBtn(btn, delta) {
    const galeria = btn.closest('.servico-galeria');
    const total   = galeria.querySelectorAll('.galeria-slide').length;
    const atual   = parseInt(galeria.dataset.galAtual || '0');
    _galeriaIr(galeria, (atual + delta + total) % total);
}

/** Vai para slide específico pelo dot */
function galeriaIrDot(dot, idx) {
    _galeriaIr(dot.closest('.servico-galeria'), idx);
}

/** Função interna: muda slide e atualiza dots */
function _galeriaIr(galeria, idx) {
    galeria.dataset.galAtual = idx;
    galeria.querySelector('.galeria-track').style.transform = `translateX(-${idx * 100}%)`;
    galeria.querySelectorAll('.galeria-dot').forEach((d, i) =>
        d.classList.toggle('active', i === idx)
    );
}

function filtrarServicos(cat) {
    document.querySelectorAll('.filter-servicos').forEach(b =>
        b.classList.toggle('active', b.dataset.servicoFilter === cat)
    );
    const lista = cat === 'todos'
        ? PROFISSIONAIS
        : PROFISSIONAIS.filter(p => p.especialidade === cat);
    renderServicos(lista);
}

function resetarServicos() {
    filtrarServicos('todos');
}

function bindFiltrosServicos() {
    document.querySelectorAll('.filter-servicos').forEach(btn => {
        btn.addEventListener('click', () => filtrarServicos(btn.dataset.servicoFilter));
    });
}

/** Exibe toast com telefone do profissional (simulado) */
function contatarProfissional(id) {
    const p = PROFISSIONAIS.find(x => x.id === id);
    if (!p) return;
    toast(`Olá ${p.nome}: (21) ${p.telefone.slice(2)}`);
}

/** Abre WhatsApp do profissional */
function wppProfissional(id) {
    const p = PROFISSIONAIS.find(x => x.id === id);
    if (!p) return;
    const msg = encodeURIComponent(
        `Olá ${p.nome.split(' ')[0]}! Vi seu perfil no Magé Express e gostaria de solicitar um orçamento de ${p.ocupacao}.`
    );
    window.open(`https://wa.me/55${p.telefone}?text=${msg}`, '_blank', 'noopener,noreferrer');
}

/** Ativa / desativa painéis ao clicar nas sub-abas */
function bindSubtabs() {
    document.querySelectorAll('.subtab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Atualiza botões
            document.querySelectorAll('.subtab-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            // Exibe painel correspondente
            const alvo = btn.dataset.subtab;
            document.querySelectorAll('.subtab-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`panel-${alvo}`).classList.add('active');
        });
    });
}

const VAGAS = [
    {
        id: 301, cargo: 'Atendente de Loja',         empresa: 'Mercado Central Magé',
        area: 'comercio', regime: 'CLT',
        salario: 'R$ 1.518', local: 'Centro, Magé',
        desc: 'Atendimento ao cliente, organização de gôndolas e frente de caixa. Experiência desejável.',
        contato: '21999990101', publicada: 'Hoje',
    },
    {
        id: 302, cargo: 'Auxiliar de Pedreiro',      empresa: 'Construtora Bramax',
        area: 'construcao', regime: 'CLT',
        salario: 'R$ 1.700', local: 'Piabetá, Magé',
        desc: 'Suporte em obras residenciais. Necessário ter experiência mínima de 6 meses.',
        contato: '21999990102', publicada: 'Hoje',
    },
    {
        id: 303, cargo: 'Técnico de TI / Suporte',   empresa: 'Prefeitura de Magé',
        area: 'tecnologia', regime: 'Temporário',
        salario: 'R$ 2.200', local: 'Centro, Magé',
        desc: 'Suporte técnico em hardware e software para equipamentos da prefeitura. Necessário diploma técnico.',
        contato: '21999990103', publicada: 'Ontem',
    },
    {
        id: 304, cargo: 'Cozinheira / Cozinheiro',   empresa: 'Restaurante Sabor Real',
        area: 'servicos', regime: 'CLT',
        salario: 'A combinar', local: 'Suruí, Magé',
        desc: 'Preparo de pratos executivos e a la carte. Experiência em cozinha industrial é diferencial.',
        contato: '21999990104', publicada: 'Há 2 dias',
    },
    {
        id: 305, cargo: 'Auxiliar de Enfermagem',    empresa: 'Clínica Saúde Magé',
        area: 'saude', regime: 'CLT',
        salario: 'R$ 1.900', local: 'Centro, Magé',
        desc: 'Assistência a pacientes, coleta de amostras e apoio em procedimentos clínicos.',
        contato: '21999990105', publicada: 'Há 2 dias',
    },
    {
        id: 306, cargo: 'Motorista Entregador',      empresa: 'DistribuiMagé Logística',
        area: 'servicos', regime: 'CLT',
        salario: 'R$ 2.000 + comissão', local: 'Magé',
        desc: 'Entrega de mercadorias em Magé e municípios vizinhos. CNH B obrigatória.',
        contato: '21999990106', publicada: 'Há 3 dias',
    },
    {
        id: 307, cargo: 'Recepcionista',             empresa: 'Academia Fit Magé',
        area: 'servicos', regime: 'CLT',
        salario: 'R$ 1.518', local: 'Barbuda, Magé',
        desc: 'Recepção de alunos, controle de acesso, agendamentos e suporte administrativo.',
        contato: '21999990107', publicada: 'Há 4 dias',
    },
    {
        id: 308, cargo: 'Eletricista Autônomo',      empresa: 'Obras Piabetá',
        area: 'construcao', regime: 'Autônomo',
        salario: 'A combinar', local: 'Piabetá, Magé',
        desc: 'Instalações elétricas em obra de médio porte. Disponibilidade imediata.',
        contato: '21999990108', publicada: 'Há 5 dias',
    },
    {
        id: 309, cargo: 'Designer Gráfico Freelancer', empresa: 'Agência Digital Local',
        area: 'tecnologia', regime: 'Freelancer',
        salario: 'R$ 80–120/peça', local: 'Remoto / Magé',
        desc: 'Criação de posts para redes sociais, flyers e identidade visual. Portfólio obrigatório.',
        contato: '21999990109', publicada: 'Há 6 dias',
    },
    {
        id: 310, cargo: 'Auxiliar de Limpeza',       empresa: 'Escola Estadual Magé',
        area: 'outros', regime: 'CLT',
        salario: 'R$ 1.518', local: 'Centro, Magé',
        desc: 'Serviços de limpeza e conservação em ambiente escolar. Turnos manhã ou tarde.',
        contato: '21999990110', publicada: 'Há 7 dias',
    },
];

// Armazena vagas adicionadas pelo usuário
let vagasExtra = [];

function renderVagas(lista) {
    const grid     = document.getElementById('vagas-grid');
    const msgVazia = document.getElementById('vagas-no-results');

    if (!grid) return;

    if (lista.length === 0) {
        grid.innerHTML = '';
        msgVazia.style.display = 'block';
        return;
    }

    msgVazia.style.display = 'none';
    grid.innerHTML = lista.map(buildVagaCardHTML).join('');

    grid.querySelectorAll('.vaga-card').forEach((card, i) => {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity .4s ease, transform .4s ease';
            card.style.opacity    = '1';
            card.style.transform  = 'translateY(0)';
        }, i * 55);
    });
}

function buildVagaCardHTML(v) {
    const salarioCls = v.salario.toLowerCase().includes('combinar') ? '' : 'salario';
    return `
        <div class="vaga-card">
            <div class="vaga-card-header">
                <h3>${v.cargo}</h3>
                <span class="vaga-regime-badge">${v.regime}</span>
            </div>
            <div class="vaga-card-body">
                <div class="vaga-empresa-row">
                    <i class="fas fa-building"></i> ${v.empresa}
                </div>
                <div class="vaga-info-row">
                    <span class="vaga-chip"><i class="fas fa-map-marker-alt"></i> ${v.local}</span>
                    <span class="vaga-chip ${salarioCls}"><i class="fas fa-dollar-sign"></i> ${v.salario}</span>
                </div>
                <p class="vaga-desc">${v.desc}</p>
                <div class="vaga-publicada"><i class="fas fa-clock"></i> Publicada: ${v.publicada}</div>
                <button class="btn-vaga-candidatar" onclick="candidatarVaga(${v.id})">
                    <i class="fab fa-whatsapp"></i> Candidatar-se
                </button>
            </div>
        </div>`;
}

function filtrarVagas(area) {
    document.querySelectorAll('.filter-vagas').forEach(b =>
        b.classList.toggle('active', b.dataset.vagaFilter === area)
    );
    const todasVagas = [...VAGAS, ...vagasExtra];
    const lista = area === 'todas' ? todasVagas : todasVagas.filter(v => v.area === area);
    renderVagas(lista);
}

function resetarVagas() { filtrarVagas('todas'); }

function bindFiltrosVagas() {
    document.querySelectorAll('.filter-vagas').forEach(btn => {
        btn.addEventListener('click', () => filtrarVagas(btn.dataset.vagaFilter));
    });
}

function candidatarVaga(id) {
    const v = [...VAGAS, ...vagasExtra].find(x => x.id === id);
    if (!v) return;
    const msg = encodeURIComponent(
        `Olá! Vi a vaga de "${v.cargo}" na empresa "${v.empresa}" pelo Magé Express e gostaria de me candidatar.`
    );
    window.open(`https://wa.me/55${v.contato}?text=${msg}`, '_blank', 'noopener,noreferrer');
}

function abrirFormVaga() {
    document.getElementById('modal-vaga').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function fecharFormVaga(e) {
    // Fecha somente se clicar no overlay ou no botão fechar
    if (e && e.target !== document.getElementById('modal-vaga') && !e.target.classList.contains('modal-close')) return;
    document.getElementById('modal-vaga').style.display = 'none';
    document.body.style.overflow = '';
}

function enviarVaga(e) {
    e.preventDefault();
    const nova = {
        id       : Date.now(),
        cargo    : document.getElementById('vaga-cargo').value.trim(),
        empresa  : document.getElementById('vaga-empresa').value.trim(),
        area     : document.getElementById('vaga-area').value,
        regime   : document.getElementById('vaga-regime').value,
        salario  : document.getElementById('vaga-salario').value.trim() || 'A combinar',
        local    : document.getElementById('vaga-local').value.trim(),
        desc     : document.getElementById('vaga-desc').value.trim(),
        contato  : document.getElementById('vaga-contato').value.replace(/\D/g, ''),
        publicada: 'Agora mesmo',
    };

    vagasExtra.unshift(nova);
    renderVagas([...vagasExtra, ...VAGAS]);
    document.getElementById('form-vaga').reset();
    document.getElementById('modal-vaga').style.display = 'none';
    document.body.style.overflow = '';
    toast(`Ótimo. Vaga "${nova.cargo}" publicada com sucesso!`);
}

function gerarCurriculo(e) {
    e.preventDefault();
    const nome     = document.getElementById('cv-nome').value.trim();
    const prof     = document.getElementById('cv-profissao').value.trim();
    const tel      = document.getElementById('cv-telefone').value.trim();
    const email    = document.getElementById('cv-email').value.trim();
    const local    = document.getElementById('cv-local').value.trim();
    const disp     = document.getElementById('cv-disponibilidade').value;
    const resumo   = document.getElementById('cv-resumo').value.trim();
    const cargo    = document.getElementById('cv-cargo').value.trim();
    const empresa  = document.getElementById('cv-empresa').value.trim();
    const periodo  = document.getElementById('cv-periodo').value.trim();
    const ativ     = document.getElementById('cv-atividades').value.trim();
    const escol    = document.getElementById('cv-escolaridade').value;
    const curso    = document.getElementById('cv-curso').value.trim();
    const habStr   = document.getElementById('cv-habilidades').value.trim();

    const inicial  = nome.charAt(0).toUpperCase();
    const emailHTML = email ? `<span class="cv-contato-item"><i class="fas fa-envelope"></i> ${email}</span>` : '';
    const resumoHTML = resumo
        ? `<div class="cv-secao"><h4><i class="fas fa-user"></i> Sobre Mim</h4><p>${resumo}</p></div>`
        : '';

    const expHTML = cargo
        ? `<div class="cv-secao">
            <h4><i class="fas fa-briefcase"></i> Experiência Profissional</h4>
            <div class="cv-exp-item">
                <div class="cv-exp-cargo">${cargo}</div>
                ${empresa ? `<div class="cv-exp-emp">${empresa}</div>` : ''}
                ${periodo ? `<div class="cv-exp-per"><i class="fas fa-calendar-alt"></i> ${periodo}</div>` : ''}
                ${ativ    ? `<div class="cv-exp-ativ">${ativ}</div>` : ''}
            </div>
           </div>`
        : '';

    const formacaoHTML = escol
        ? `<div class="cv-secao">
            <h4><i class="fas fa-graduation-cap"></i> Formação</h4>
            <p><strong>${escol}</strong>${curso ? ` — ${curso}` : ''}</p>
           </div>`
        : '';

    const tags = habStr
        ? habStr.split(',').map(h => `<span class="cv-tag">${h.trim()}</span>`).join('')
        : '';
    const habHTML = tags
        ? `<div class="cv-secao"><h4><i class="fas fa-star"></i> Habilidades</h4><div class="cv-tags">${tags}</div></div>`
        : '';

    document.getElementById('cv-card').innerHTML = `
        <div class="cv-topo">
            <div class="cv-avatar-grande">${inicial}</div>
            <div class="cv-topo-info">
                <h2>${nome}</h2>
                <p>${prof}</p>
                <div class="cv-topo-contatos">
                    <span class="cv-contato-item"><i class="fas fa-phone-alt"></i> ${tel}</span>
                    ${emailHTML}
                    <span class="cv-contato-item"><i class="fas fa-map-marker-alt"></i> ${local}</span>
                </div>
            </div>
        </div>
        <div class="cv-corpo">
            ${resumoHTML}
            ${expHTML}
            ${formacaoHTML}
            ${habHTML}
            <div class="cv-secao">
                <h4><i class="fas fa-check-circle"></i> Disponibilidade</h4>
                <span class="cv-disponivel"><i class="fas fa-calendar-check"></i> ${disp}</span>
            </div>
        </div>`;

    document.getElementById('curriculo-form-area').style.display  = 'none';
    document.getElementById('curriculo-preview').style.display    = 'block';
}

function editarCurriculo() {
    document.getElementById('curriculo-form-area').style.display  = 'block';
    document.getElementById('curriculo-preview').style.display    = 'none';
}

function publicarCurriculo() {
    toast('Ótimo. Currículo publicado! Recrutadores de Magé já podem te encontrar.');
}

function initAndroidBottomNav() {
    const nav = document.getElementById('android-bottom-nav');
    if (!nav) return;

    const itens = Array.from(nav.querySelectorAll('.android-nav-item'));
    const hamburger = document.getElementById('hamburger');

    function ativar(item) {
        itens.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    }

    itens.forEach(item => {
        item.addEventListener('click', e => {
            ativar(item);

            const tipo = item.dataset.navItem;
            if (tipo === 'gaveta') {
                e.preventDefault();
                if (hamburger) hamburger.click();
                return;
            }

            const destino = item.getAttribute('href');
            if (destino) {
                e.preventDefault();
                setTimeout(() => {
                    window.location.href = destino;
                }, 170);
            }
        });
    });
}

/* ?????????????????????????????????????????????
   INICIALIZAÇÃO
????????????????????????????????????????????? */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('servicos-grid')) renderServicos(PROFISSIONAIS);
    if (document.getElementById('vagas-grid'))    renderVagas(VAGAS);
    bindFiltrosServicos();
    bindSubtabs();
    bindFiltrosVagas();
    initAndroidBottomNav();
});