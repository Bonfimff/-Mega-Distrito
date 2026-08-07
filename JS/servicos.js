'use strict';
/* =========================================================
   MEGA DISTRITO - SERVIÇOS
   Renderização de profissionais, vagas e currículo
   ========================================================= */
/* OBS. (performance): renderServicos reconstrói o HTML da grade inteira a
   cada chamada de filtrarServicos(cat). Diferente de script.js (onde a
   reconstrução total é necessária por causa da busca por texto livre),
   aqui o filtro é só por categoria fixa (p.especialidade === cat), então
   em tese um toggle de visibilidade seria possível. Optamos por manter a
   reconstrução total mesmo assim porque cada card tem um carrossel de
   fotos com setInterval próprio (iniciarGalerias/_galeriaTimers) que
   precisa ser recriado/limpo a cada troca de filtro — introduzir toggle
   de visibilidade exigiria pausar/retomar esses timers por card oculto
   (para não girar carrossel invisível) e manter os cards antigos + os
   possivelmente novos (profissionais carregados via API) sincronizados,
   o que aumenta bastante o risco de vazamento de timers/memória para um
   ganho pequeno (a lista de profissionais não costuma ser grande). */
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
    const nome         = escapeHtml(p.nome);
    const inicial      = escapeHtml(p.nome.charAt(0).toUpperCase());
    const ocupacao     = escapeHtml(p.ocupacao);
    const desc         = escapeHtml(p.desc);
    const bairro       = escapeHtml(p.bairro);
    const atende       = escapeHtml(p.atende);
    const horario      = escapeHtml(p.horario);
    const unidade      = escapeHtml(p.unidade);
    const estrelas     = buildEstrelas(p.avaliacao);
    const dispCls      = p.disponivel ? 'disponivel-sim' : 'disponivel-nao';
    const dispTitle    = p.disponivel ? 'Disponível agora' : 'Indisponível no momento';

    // Galeria de fotos
    const fotos = p.fotos || FOTOS_ESPECIALIDADE[p.especialidade] || [];
    const slidesHTML = fotos.map(f =>
        `<img class="galeria-slide" src="${f.src}" alt="${escapeHtml(f.alt || '')}" loading="lazy">`
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
    const tags = p.tags.map(t => `<span class="servico-tag">${escapeHtml(t)}</span>`).join('');

    return `
        <div class="servico-card" data-servico-id="${p.id}">
            ${galeriaHTML}
            <span class="servico-disponivel ${dispCls}" title="${dispTitle}"></span>
            <div class="servico-card-body">
                <div class="servico-perfil">
                    <div class="servico-avatar" style="background:${cor};">${inicial}</div>
                    <div class="servico-perfil-info">
                        <div class="servico-nome">${nome}</div>
                        <div class="servico-ocupacao">${ocupacao}</div>
                        <div class="servico-rating">
                            <span class="stars">${estrelas}</span>
                            <span class="count">${p.avaliacao.toFixed(1)} (${p.avaliacoes} avaliações)</span>
                        </div>
                    </div>
                </div>
                ${verificBadge}
                <p class="servico-desc">${desc}</p>
                <div class="servico-tags">${tags}</div>
                <div class="servico-meta">
                    <div class="servico-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span><strong>${bairro}</strong> · Atende: ${atende}</span>
                    </div>
                    <div class="servico-meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${horario}</span>
                    </div>
                </div>
                <div class="servico-preco">
                    <div class="servico-preco-label">A partir de</div>
                    <div class="servico-preco-valor">
                        ${brl(p.preco)} <span>/ ${unidade}</span>
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

function buildDestaqueCardHTML(p) {
    const cor     = SERVICO_CORES[p.especialidade] || '#607d8b';
    const nome    = escapeHtml(p.nome);
    const inicial = escapeHtml(p.nome.charAt(0).toUpperCase());
    const ocupacao = escapeHtml(p.ocupacao);
    return `
        <article class="servico-destaque-card" data-servico-id="${p.id}">
            <div class="servico-destaque-avatar" style="background:${cor};">${inicial}</div>
            <div class="servico-destaque-info">
                <strong>${nome}</strong>
                <span>${ocupacao}</span>
                <span class="servico-destaque-rating"><i class="fas fa-star"></i> ${p.avaliacao.toFixed(1)} (${p.avaliacoes})</span>
            </div>
            <button class="servico-destaque-btn" onclick="verPerfilDestaque(${p.id})">Ver perfil</button>
        </article>
    `;
}

/** Renderiza a esteira de profissionais em destaque (verificados e melhor avaliados) */
function renderDestaqueProfissionais() {
    const rail = document.getElementById('servicos-destaque-rail');
    if (!rail) return;

    const destaques = [...PROFISSIONAIS]
        .filter(p => p.verificado)
        .sort((a, b) => b.avaliacao - a.avaliacao || b.avaliacoes - a.avaliacoes)
        .slice(0, 6);

    rail.innerHTML = destaques.map(buildDestaqueCardHTML).join('');
}

/** Filtra pela especialidade do profissional em destaque e rola até o card dele */
function verPerfilDestaque(id) {
    const p = PROFISSIONAIS.find(x => x.id === id);
    if (!p) return;
    filtrarServicos('todos');
    requestAnimationFrame(() => {
        const card = document.querySelector(`.servico-card[data-servico-id="${id}"]`);
        card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
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
        `Olá ${p.nome.split(' ')[0]}! Vi seu perfil no Mega Distrito e gostaria de solicitar um orçamento de ${p.ocupacao}.`
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

// Armazena vagas adicionadas pelo usuário
let vagasExtra = [];

/* OBS. (performance): renderVagas também reconstrói a grade inteira a
   cada filtrarVagas(area). Aqui o filtro também é só por atributo fixo
   (v.area === area), mas mantemos a reconstrução total porque a lista de
   vagas muda de tamanho em tempo real (enviarVaga() insere um novo item
   em vagasExtra e re-renderiza), então um toggle simples nos cards já
   existentes não daria conta de inserir o card da vaga recém-publicada
   sem duplicar a lógica de renderização. Como a lista de vagas é
   pequena, o custo do rebuild completo é desprezível. */
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
    const cargo    = escapeHtml(v.cargo);
    const regime   = escapeHtml(v.regime);
    const empresa  = escapeHtml(v.empresa);
    const local    = escapeHtml(v.local);
    const salario  = escapeHtml(v.salario);
    const desc     = escapeHtml(v.desc);
    const publicada = escapeHtml(v.publicada);
    return `
        <div class="vaga-card">
            <div class="vaga-card-header">
                <h3>${cargo}</h3>
                <span class="vaga-regime-badge">${regime}</span>
            </div>
            <div class="vaga-card-body">
                <div class="vaga-empresa-row">
                    <i class="fas fa-building"></i> ${empresa}
                </div>
                <div class="vaga-info-row">
                    <span class="vaga-chip"><i class="fas fa-map-marker-alt"></i> ${local}</span>
                    <span class="vaga-chip ${salarioCls}"><i class="fas fa-dollar-sign"></i> ${salario}</span>
                </div>
                <p class="vaga-desc">${desc}</p>
                <div class="vaga-publicada"><i class="fas fa-clock"></i> Publicada: ${publicada}</div>
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
        `Olá! Vi a vaga de "${v.cargo}" na empresa "${v.empresa}" pelo Mega Distrito e gostaria de me candidatar.`
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

    // Campos de texto livre vindos do formulário — escapar antes de interpolar em innerHTML
    const nomeSeguro    = escapeHtml(nome);
    const profSeguro    = escapeHtml(prof);
    const telSeguro     = escapeHtml(tel);
    const emailSeguro   = escapeHtml(email);
    const localSeguro   = escapeHtml(local);
    const dispSeguro    = escapeHtml(disp);
    const resumoSeguro  = escapeHtml(resumo);
    const cargoSeguro   = escapeHtml(cargo);
    const empresaSeguro = escapeHtml(empresa);
    const periodoSeguro = escapeHtml(periodo);
    const ativSeguro    = escapeHtml(ativ);
    const escolSeguro   = escapeHtml(escol);
    const cursoSeguro   = escapeHtml(curso);

    const inicial  = escapeHtml(nome.charAt(0).toUpperCase());
    const emailHTML = email ? `<span class="cv-contato-item"><i class="fas fa-envelope"></i> ${emailSeguro}</span>` : '';
    const resumoHTML = resumo
        ? `<div class="cv-secao"><h4><i class="fas fa-user"></i> Sobre Mim</h4><p>${resumoSeguro}</p></div>`
        : '';

    const expHTML = cargo
        ? `<div class="cv-secao">
            <h4><i class="fas fa-briefcase"></i> Experiência Profissional</h4>
            <div class="cv-exp-item">
                <div class="cv-exp-cargo">${cargoSeguro}</div>
                ${empresa ? `<div class="cv-exp-emp">${empresaSeguro}</div>` : ''}
                ${periodo ? `<div class="cv-exp-per"><i class="fas fa-calendar-alt"></i> ${periodoSeguro}</div>` : ''}
                ${ativ    ? `<div class="cv-exp-ativ">${ativSeguro}</div>` : ''}
            </div>
           </div>`
        : '';

    const formacaoHTML = escol
        ? `<div class="cv-secao">
            <h4><i class="fas fa-graduation-cap"></i> Formação</h4>
            <p><strong>${escolSeguro}</strong>${curso ? ` — ${cursoSeguro}` : ''}</p>
           </div>`
        : '';

    const tags = habStr
        ? habStr.split(',').map(h => `<span class="cv-tag">${escapeHtml(h.trim())}</span>`).join('')
        : '';
    const habHTML = tags
        ? `<div class="cv-secao"><h4><i class="fas fa-star"></i> Habilidades</h4><div class="cv-tags">${tags}</div></div>`
        : '';

    document.getElementById('cv-card').innerHTML = `
        <div class="cv-topo">
            <div class="cv-avatar-grande">${inicial}</div>
            <div class="cv-topo-info">
                <h2>${nomeSeguro}</h2>
                <p>${profSeguro}</p>
                <div class="cv-topo-contatos">
                    <span class="cv-contato-item"><i class="fas fa-phone-alt"></i> ${telSeguro}</span>
                    ${emailHTML}
                    <span class="cv-contato-item"><i class="fas fa-map-marker-alt"></i> ${localSeguro}</span>
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
                <span class="cv-disponivel"><i class="fas fa-calendar-check"></i> ${dispSeguro}</span>
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

/* =========================================================
   CARREGAMENTO (API)
   ========================================================= */
async function carregarProfissionais() {
    const profissionais = await fetchProfissionais();
    if (profissionais) PROFISSIONAIS = profissionais.map(mapProfissional);
}

async function carregarVagas() {
    const vagas = await fetchVagas();
    if (vagas) VAGAS = vagas.map(mapVaga);
}

/** Junta em PROFISSIONAIS os serviços que o próprio usuário logado
 *  cadastrou pela conta (Conta > Meus Anúncios — ver conta.js). Assim como
 *  o Bazar, ainda vive só no localStorage (sem endpoint de backend pra
 *  usuário comum virar prestador de serviço), então só aparece pra quem
 *  cadastrou, no navegador em que cadastrou. Como não têm "especialidade"
 *  (categoria dos filtros), só aparecem no filtro "Todos".  */
function mesclarAnunciosLocaisNosServicos() {
    if (typeof contaObterSessao !== 'function') return;
    const usuario = contaObterSessao();
    if (!usuario) return;
    let locais = [];
    try { locais = JSON.parse(localStorage.getItem(`mage-servicos-usuario-${usuario.id}`)) || []; }
    catch { locais = []; }
    if (!locais.length) return;
    const idsExistentes = new Set(PROFISSIONAIS.map(p => p.id));
    locais.forEach(servico => {
        if (!idsExistentes.has(servico.id)) PROFISSIONAIS.unshift(servico);
    });
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([carregarProfissionais(), carregarVagas()]);
    mesclarAnunciosLocaisNosServicos();

    if (document.getElementById('servicos-grid')) renderServicos(PROFISSIONAIS);
    if (document.getElementById('vagas-grid'))    renderVagas(VAGAS);
    renderDestaqueProfissionais();
    bindFiltrosServicos();
    bindSubtabs();
    bindFiltrosVagas();
});