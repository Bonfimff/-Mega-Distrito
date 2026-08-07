'use strict';

const GM_DEFAULT = {
	name: 'Loja Central',
	storeCategory: 'Alimentação',
	subtitle: 'Ofertas e novidades para voce',
	address: 'Rua Principal, 123 - Mage',
	addressUrl: 'https://maps.google.com',
	primary: '#2e7d32',
	accent: '#1565c0',
	banner: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
	card: 'https://images.unsplash.com/photo-1468495244123-6c6f332b7a90?auto=format&fit=crop&w=900&q=80',
	icon: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=200&q=80',
	itemType: 'produto',
	itemName: '',
	itemDescription: '',
	itemPrice: '',
	itemPhoto: '',
	itemVideo: '',
	itemCategory: '',
	itemSubcategory: '',
	itemSubcategoryCustom: '',
	itemBrand: '',
	itemQty: '',
	itemColor: '',
	itemVoltage: '',
	itemDuration: '',
	itemDelivery: true,
	itemPickup: true,
	storeProfile: PERFIL_LOJA_PADRAO,
	openTime: '09:00',
	closeTime: '18:00',
	closedDates: [],
	itemCardMode: 'portrait',
	filters: [
		{ name: 'Bebidas', value: 'bebidas', manualItems: [] },
		{ name: 'Ferramentas', value: 'ferramentas', manualItems: [] },
		{ name: 'Combo', value: 'combo', manualItems: [] }
	],
	items: [
		{
			type: 'produto',
			name: 'Combo da Casa',
			description: 'Lanche artesanal com bebida e acompanhamento.',
			price: '39,90',
			priceOld: '',
			photo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
			fotos: ['https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80'],
			video: '',
			category: 'Alimentação',
			subcategory: 'Combo',
			brand: '',
			qty: '5',
			color: '',
			voltage: '',
			delivery: true,
			pickup: true,
			variacoes: []
		},
		{
			type: 'servico',
			name: 'Instalacao Residencial',
			description: 'Servico tecnico com atendimento no mesmo dia.',
			price: '120,00',
			priceOld: '',
			photo: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
			fotos: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80'],
			video: '',
			category: 'Serviços Gerais',
			subcategory: 'Instalação',
			brand: '',
			qty: '',
			color: '',
			voltage: '',
			delivery: false,
			pickup: true,
			variacoes: []
		}
	]
};

/* =========================================================
   ATIVIDADE — compras, contratações e mensagens de clientes
   Dados de demonstração (sem backend ainda). Ver DESIGN_GUIDE.md
   §3.3 — nenhum número aqui deve ser exibido como prova social
   pública; esta aba é o painel interno do próprio lojista.
   ========================================================= */
/* Etapas do trabalho após o pedido — cada tipo tem seu próprio fluxo,
   já que um serviço não tem etiqueta de envio. `acao` é o rótulo do
   botão que avança para a próxima etapa (vazio na etapa final). */
const GM_ETAPAS_PRODUTO = [
	{ label: 'Pedido recebido', acao: 'Gerar etiqueta de envio' },
	{ label: 'Etiqueta gerada', acao: 'Marcar como postado' },
	{ label: 'Postado', acao: 'Marcar como entregue' },
	{ label: 'Entregue', acao: '' },
];

const GM_ETAPAS_SERVICO = [
	{ label: 'Solicitação recebida', acao: 'Confirmar agendamento' },
	{ label: 'Confirmado', acao: 'Marcar como realizado' },
	{ label: 'Serviço realizado', acao: '' },
];

function getEtapasPedido(tipo) {
	return tipo === 'servico' ? GM_ETAPAS_SERVICO : GM_ETAPAS_PRODUTO;
}

const GM_PEDIDOS = [
	{
		id: 1,
		tipo: 'produto',
		cliente: 'Fernanda Souza',
		item: 'Combo da Casa',
		valor: '39,90',
		quando: 'Há 12 minutos',
		data: '2026-02-18',
		etapaIndex: 0,
	},
	{
		id: 2,
		tipo: 'servico',
		cliente: 'Carlos Eduardo',
		item: 'Instalação Residencial',
		valor: '120,00',
		quando: 'Há 2 horas',
		data: '2026-02-17',
		etapaIndex: 1,
	},
	{
		id: 3,
		tipo: 'produto',
		cliente: 'Marcos Lima',
		item: 'Combo da Casa',
		valor: '39,90',
		quando: 'Ontem',
		data: '2026-01-22',
		etapaIndex: 3,
	},
];

let gmPedidos = [];

/* Indicadores de demonstração (sem backend) para a aba Painel. */
const GM_DASHBOARD = {
	carrinhoUsuarios: 47,
	produtosMaisCurtidos: [
		{ nome: 'Combo da Casa', valor: 86 },
		{ nome: 'Instalação Residencial', valor: 34 },
		{ nome: 'Combo Família', valor: 21 },
	],
	produtosMaisComprados: [
		{ nome: 'Combo da Casa', valor: 52 },
		{ nome: 'Instalação Residencial', valor: 19 },
		{ nome: 'Combo Família', valor: 11 },
	],
};

/* Avaliações de demonstração (sem backend ainda) para o card acima
   de "Mensagens e Interações". */
const GM_AVALIACOES = {
	distribuicao: { 5: 20, 4: 8, 3: 3, 2: 1, 1: 0 },
	recentes: [
		{ cliente: 'Fernanda Souza', nota: 5, comentario: 'Atendimento rápido e produto exatamente como anunciado.' },
		{ cliente: 'Carlos Eduardo', nota: 4, comentario: 'Muito bom, só demorou um pouco mais que o combinado.' },
	],
};

/* Mensagens de demonstração (sem backend) para testar a caixa de
   Mensagens e Interações antes de haver conversas reais. */
const GM_MENSAGENS_DEMO = [
	{
		id: 9001,
		tipo: 'compra',
		cliente: 'Fernanda Souza',
		mensagem: 'Oi! O Combo da Casa que comprei ainda vem hoje? Já são 18h.',
		item: 'Combo da Casa',
		quando: 'Há 8 minutos',
		lida: false,
		anexosCliente: [],
		respostas: [],
	},
	{
		id: 9002,
		tipo: 'interacao',
		cliente: 'Carlos Eduardo',
		mensagem: 'Vocês fazem instalação no fim de semana também?',
		item: 'Instalação Residencial',
		quando: 'Há 1 hora',
		lida: true,
		anexosCliente: [],
		respostas: [
			{ texto: 'Fazemos sim, aos sábados até 14h!', anexos: [], quando: 'Há 50 minutos' },
		],
	},
];

let gmLojaId = null;
let gmMensagens = GM_MENSAGENS_DEMO.map(m => ({ ...m, anexosCliente: [...m.anexosCliente], respostas: m.respostas.map(r => ({ ...r })) }));
let gmMensagensFiltro = 'compra';
let gmChatWindows = []; // janelas de conversa flutuantes (telas grandes), estilo Facebook: [{ id, minimizada }]
const GM_CHAT_MAX_JANELAS = 3;

// Em telas pequenas as conversas continuam abrindo em tela cheia dentro do
// próprio painel de mensagens (sem espaço para janelas flutuantes).
function gmTelaGrande() {
	return window.matchMedia('(min-width: 1024px)').matches;
}
let gmMensagemAbertaId = -1;
let gmComposerAnexos = [];
let gmComposerTexto = '';
let gmComposerMenuAberto = false;

const GM_TIPO_ANEXO_ICON = {
	foto: 'fa-image',
	video: 'fa-video',
	documento: 'fa-file-alt',
};

const GM_SUBCATEGORY_MAP = {
	'alimentacao': ['Bebida', 'Lanche', 'Combo', 'Sobremesa', 'Marmita'],
	'eletronicos': ['Celular', 'Acessórios', 'TV', 'Som', 'Games'],
	'moda e vestuario': ['Masculino', 'Feminino', 'Infantil', 'Calçados', 'Acessórios'],
	'casa e decoracao': ['Cozinha', 'Quarto', 'Sala', 'Banheiro', 'Jardim'],
	'beleza e saude': ['Perfumaria', 'Cosméticos', 'Higiene', 'Suplementos'],
	'servicos gerais': ['Instalação', 'Manutenção', 'Limpeza', 'Consultoria'],
	'mercado / mercearia': ['Bebidas', 'Hortifruti', 'Padaria', 'Limpeza', 'Congelados']
};

const GM_CATEGORIA_MASTER_LIST = [
	'Alimentação', 'Eletrônicos', 'Moda e Vestuário', 'Casa e Decoração',
	'Beleza e Saúde', 'Serviços Gerais', 'Mercado / Mercearia',
	'Construção e Reforma', 'Outro',
];

function refreshCategoryOptionsForProfile() {
	const select = document.getElementById('gm-item-category');
	if (!select) return;
	const perfil = obterPerfilLoja(gmStoreProfile);
	const sugeridas = (perfil.categoriasSugeridas || []).filter(cat => GM_CATEGORIA_MASTER_LIST.includes(cat));
	const previous = select.value;

	select.innerHTML = '';
	select.appendChild(new Option('Selecione...', ''));

	if (sugeridas.length) {
		const grupoSugeridas = document.createElement('optgroup');
		grupoSugeridas.label = 'Sugeridas para seu perfil';
		sugeridas.forEach(cat => grupoSugeridas.appendChild(new Option(cat, cat)));
		select.appendChild(grupoSugeridas);
	}

	const restantes = GM_CATEGORIA_MASTER_LIST.filter(cat => !sugeridas.includes(cat));
	if (restantes.length) {
		const grupoOutras = document.createElement('optgroup');
		grupoOutras.label = sugeridas.length ? 'Outras categorias' : 'Categorias';
		restantes.forEach(cat => grupoOutras.appendChild(new Option(cat, cat)));
		select.appendChild(grupoOutras);
	}

	if (previous && Array.from(select.options).some(o => o.value === previous)) {
		select.value = previous;
	}
}

let gmItems = [];
let gmItemsOriginalIds = [];
let gmEditingIndex = -1;
let gmFilters = [];
let gmActiveFilterIndex = -1;
let gmEditingFilterIndex = -1;
let gmClosedDates = [];
let gmPreviewVisible = false;
let gmSalvandoLoja = false;
let gmStoreProfile = PERFIL_LOJA_PADRAO;
let gmFormSujo = false; // há alterações na loja/catálogo ainda não salvas
let gmSaidaPendenteHref = null;

const GM_PERMISSOES_LABELS = {
	catalogo: 'Catálogo',
	pedidos: 'Pedidos',
	mensagens: 'Mensagens',
	indicadores: 'Indicadores',
	configuracoes: 'Config. da loja',
	equipe: 'Equipe',
};
let gmNiveisAcesso = [
	{ id: 'nivel-gerente', nome: 'Gerente', permissoes: ['catalogo', 'pedidos', 'mensagens', 'indicadores', 'configuracoes', 'equipe'] },
	{ id: 'nivel-vendedor', nome: 'Vendedor', permissoes: ['catalogo', 'pedidos', 'mensagens'] },
];
let gmFuncionarios = [
	{ id: 'func-1', nome: 'Marcos Lima', contato: '(21) 99999-1234', nivelId: 'nivel-gerente' },
];
let gmEntregadores = [
	{ id: 'entregador-1', nome: 'Rafael Alves', telefone: '(21) 98888-4321', veiculo: 'moto', ativo: true },
];

// Rascunho do item em edição — fotos, vídeo e variações só entram em
// gmItems quando "Adicionar item"/"Salvar item" é clicado.
let gmItemPhotosDraft = [];
let gmItemVideoDraft = '';
let gmVariationsDraft = [];
const gmPreviewSelectedFoto = {}; // índice da foto ativa na galeria da prévia, por itemIndex

let gmToastTimer = null;
function gmToast(msg, actionLabel, actionFn) {
	const el = document.getElementById('toast');
	if (!el) return;
	el.innerHTML = '';
	el.appendChild(document.createTextNode(msg));

	if (actionLabel && actionFn) {
		const actionBtn = document.createElement('button');
		actionBtn.type = 'button';
		actionBtn.className = 'toast-action';
		actionBtn.textContent = actionLabel;
		actionBtn.addEventListener('click', () => {
			actionFn();
			el.classList.remove('show');
		});
		el.appendChild(actionBtn);
	}

	el.classList.add('show');
	clearTimeout(gmToastTimer);
	gmToastTimer = setTimeout(() => el.classList.remove('show'), actionLabel ? 4500 : 2300);
}

function setBgFromUrl(el, url, fallbackGradient) {
	if (!el) return;
	if (url) {
		el.style.backgroundImage = `url('${url}')`;
		return;
	}
	el.style.backgroundImage = fallbackGradient;
}

/* =========================================================
   PERFIL DA LOJA — adapta os campos do formulário de item
   conforme o tipo de negócio (ver JS/data/perfis-loja.js)
   ========================================================= */
function renderProfilePicker() {
	const wrap = document.getElementById('gm-profile-picker');
	if (!wrap) return;
	wrap.innerHTML = '';

	PERFIS_LOJA.forEach(perfil => {
		const label = createEl('label', 'gm-profile-card');
		label.dataset.profileId = perfil.id;

		const input = document.createElement('input');
		input.type = 'radio';
		input.name = 'gm-store-profile';
		input.value = perfil.id;
		input.className = 'gm-visually-hidden';
		input.checked = perfil.id === gmStoreProfile;
		label.appendChild(input);

		const icon = createEl('span', 'gm-profile-card-icon');
		icon.innerHTML = `<i class="${perfil.icone}"></i>`;
		label.appendChild(icon);

		const body = createEl('span', 'gm-profile-card-body');
		body.appendChild(createEl('strong', 'gm-profile-card-name', perfil.nome));
		body.appendChild(createEl('span', 'gm-profile-card-desc', perfil.descricao));
		label.appendChild(body);

		wrap.appendChild(label);
	});

	updateProfilePickerSelection();
}

function updateProfilePickerSelection() {
	const wrap = document.getElementById('gm-profile-picker');
	if (!wrap) return;
	wrap.querySelectorAll('.gm-profile-card').forEach(card => {
		const isActive = card.dataset.profileId === gmStoreProfile;
		card.classList.toggle('active', isActive);
		const input = card.querySelector('input[type="radio"]');
		if (input) input.checked = isActive;
	});
}

function setStoreProfile(perfilId) {
	const perfil = obterPerfilLoja(perfilId);
	gmStoreProfile = perfil.id;
	updateProfilePickerSelection();
	applyStoreProfileToItemForm();
	aplicarPreview();
}

/* Um elemento pode ficar escondido por mais de um motivo (perfil da
   loja E modo simples/avançado ao mesmo tempo) — cada motivo guarda
   seu próprio estado em dataset, e o elemento só reaparece quando
   NENHUM motivo pede para escondê-lo. */
function setElementHideReason(el, motivo, esconder) {
	if (!el) return;
	el.dataset[`hide${motivo[0].toUpperCase()}${motivo.slice(1)}`] = esconder ? 'true' : 'false';
	const escondidoPorProfile = el.dataset.hideProfile === 'true';
	const escondidoPorMode = el.dataset.hideMode === 'true';
	el.classList.toggle('gm-hidden', escondidoPorProfile || escondidoPorMode);
}

/* =========================================================
   MODO SIMPLES / AVANÇADO — reduz a percepção de complexidade
   do formulário de item para quem tem conhecimento básico.
   Simples = Info, Fotos, Preço, Categoria (o suficiente para
   publicar). Avançado libera Variações, Detalhes e Entrega.
   ========================================================= */
let gmFormMode = 'simples';

function applyFormModeToItemForm() {
	const isSimples = gmFormMode === 'simples';

	document.querySelectorAll('#gm-item-step-5, #gm-item-step-7').forEach(step => {
		setElementHideReason(step, 'mode', isSimples);
	});
	document.querySelectorAll('.gm-step-link--adv').forEach(link => {
		setElementHideReason(link, 'mode', isSimples);
	});
	setElementHideReason(document.getElementById('gm-item-step-6'), 'mode', isSimples);

	document.querySelectorAll('.gm-mode-btn').forEach(btn => {
		btn.classList.toggle('active', btn.dataset.formMode === gmFormMode);
	});

	const hint = document.getElementById('gm-form-mode-hint');
	if (hint) {
		hint.textContent = isSimples
			? 'Mostrando só o essencial: informações, fotos, preço e categoria. Ative o modo avançado para variações, estoque e detalhes extras.'
			: 'Modo avançado: todas as etapas do cadastro estão disponíveis.';
	}
}

function setFormMode(modo) {
	gmFormMode = modo;
	applyFormModeToItemForm();
}

function applyStoreProfileToItemForm() {
	const perfil = obterPerfilLoja(gmStoreProfile);
	const campos = perfil.campos;

	document.getElementById('gm-item-variations-group')?.classList.toggle('gm-hidden', !campos.variacoes);
	document.getElementById('gm-item-qty-group')?.classList.toggle('gm-hidden', !campos.quantidade);

	const qtyLabel = document.getElementById('gm-item-qty-label');
	if (qtyLabel && campos.quantidadeLabel) qtyLabel.textContent = campos.quantidadeLabel;
	const qtyHint = document.getElementById('gm-item-qty-hint');
	if (qtyHint) qtyHint.classList.toggle('gm-hidden', !campos.variacoes);

	document.getElementById('gm-item-technical-group')?.classList.toggle('gm-hidden', !campos.detalhesTecnicos);
	document.getElementById('gm-item-duration-group')?.classList.toggle('gm-hidden', !campos.duracao);

	const step6 = document.getElementById('gm-item-step-6');
	const step6Title = document.getElementById('gm-item-step-6-title');
	const step6Link = document.querySelector('.gm-stepper--7 a[href="#gm-item-step-6"]');
	const hideStep6ByProfile = !campos.detalhesTecnicos && !campos.duracao;
	setElementHideReason(step6, 'profile', hideStep6ByProfile);
	setElementHideReason(step6Link, 'profile', hideStep6ByProfile);
	if (step6Title) step6Title.textContent = campos.duracao ? 'Duração do atendimento' : 'Detalhes técnicos';

	const typeSelect = document.getElementById('gm-item-type');
	if (typeSelect && gmEditingIndex < 0) typeSelect.value = perfil.tipoItemPadrao;

	const textos = perfil.textos;
	document.querySelectorAll('.js-tab-label-catalogo').forEach(el => { el.textContent = textos.tabCatalogo; });
	const catalogoTitulo = document.getElementById('gm-catalogo-titulo');
	if (catalogoTitulo) catalogoTitulo.textContent = textos.catalogoTitulo;
	const catalogoSubtitulo = document.getElementById('gm-catalogo-subtitulo');
	if (catalogoSubtitulo) catalogoSubtitulo.textContent = textos.catalogoSubtitulo;
	const listaTitulo = document.getElementById('gm-items-list-titulo');
	if (listaTitulo) listaTitulo.textContent = textos.listaTitulo;
	setEditMode(gmEditingIndex >= 0);

	refreshCategoryOptionsForProfile();
}

function cloneDefaultItems() {
	return GM_DEFAULT.items.map(item => ({
		...item,
		fotos: [...(item.fotos || [])],
		variacoes: (item.variacoes || []).map(v => ({ ...v })),
	}));
}

function parsePrecoParaNumero(precoTexto) {
	const numero = Number(String(precoTexto || '0').replace(',', '.'));
	return Number.isFinite(numero) ? numero : 0;
}

function formatarPrecoParaExibicao(precoDecimal) {
	const numero = Number(precoDecimal || 0);
	return numero.toFixed(2).replace('.', ',');
}

function formatarHoraParaInput(horaSql) {
	return (horaSql || '').slice(0, 5);
}

function mapItemApiParaLocal(item) {
	const fotos = (item.fotos && item.fotos.length) ? item.fotos : (item.foto_url ? [item.foto_url] : []);
	return {
		id: item.id,
		type: item.tipo || 'produto',
		name: item.nome || '',
		description: item.descricao || '',
		price: formatarPrecoParaExibicao(item.preco),
		priceOld: item.preco_antigo ? formatarPrecoParaExibicao(item.preco_antigo) : '',
		photo: fotos[0] || '',
		fotos,
		video: item.video_url || '',
		category: item.categoria || '',
		subcategory: item.subcategoria || '',
		brand: item.marca || '',
		qty: item.quantidade != null ? String(item.quantidade) : '',
		color: item.cor || '',
		voltage: item.voltagem || '',
		duration: item.duracao_min != null ? String(item.duracao_min) : '',
		delivery: Boolean(item.entrega),
		pickup: Boolean(item.retirada),
		variacoes: (item.variacoes || []).map(v => ({
			tipo: v.tipo || 'Variação',
			valor: v.valor || '',
			estoque: v.estoque != null ? String(v.estoque) : '0',
			preco: v.preco != null ? formatarPrecoParaExibicao(v.preco) : '',
		})),
	};
}

function mapItemLocalParaApi(item, lojaId) {
	return {
		loja_id: lojaId,
		tipo: item.type,
		nome: item.name,
		descricao: item.description,
		preco: parsePrecoParaNumero(item.price),
		preco_antigo: item.priceOld ? parsePrecoParaNumero(item.priceOld) : null,
		foto_url: (item.fotos && item.fotos[0]) || item.photo || null,
		video_url: item.video || null,
		categoria: item.category || null,
		subcategoria: item.subcategory || null,
		marca: item.brand || null,
		quantidade: item.qty ? Number(item.qty) : null,
		cor: item.color || null,
		voltagem: item.voltage || null,
		duracao_min: item.duration ? Number(item.duration) : null,
		entrega: Boolean(item.delivery),
		retirada: Boolean(item.pickup),
		fotos: item.fotos || [],
		variacoes: (item.variacoes || []).map(v => ({
			tipo: v.tipo,
			valor: v.valor,
			estoque: Number(v.estoque) || 0,
			preco: v.preco ? parsePrecoParaNumero(v.preco) : null,
		})),
	};
}

function mapFiltroApiParaLocal(filtro) {
	return {
		name: filtro.nome || '',
		value: filtro.valor || '',
		manualItems: (filtro.itens_manuais || []).map(i => i.item_nome || i),
	};
}

function normalizePrice(value) {
	return (value || '').trim();
}

function formatPriceLabel(value) {
	const normalized = normalizePrice(value);
	if (!normalized) return 'Preco sob consulta';
	return `R$ ${normalized}`;
}

function normalizeCategoryKey(value) {
	return (value || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

function getSubcategoriesByCategory(category) {
	return GM_SUBCATEGORY_MAP[normalizeCategoryKey(category)] || [];
}

function getFilterLabel(filter) {
	return `${filter.name}: ${filter.value}`;
}

function getFilterName(filter) {
	return filter.name || '';
}

function formatClosedDate(value) {
	if (!value) return '';
	try {
		// Append noon time to avoid UTC midnight → previous day in UTC-3
		const date = new Date(value + 'T12:00:00');
		return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
	} catch {
		return value;
	}
}

function renderClosedDates() {
	const list = document.getElementById('gm-closed-dates-list');
	if (!list) return;
	list.innerHTML = '';
	if (!gmClosedDates.length) {
		list.textContent = 'Nenhuma data fechada selecionada.';
		return;
	}
	gmClosedDates.forEach((date, index) => {
		const item = createEl('div', 'gm-closed-date-item');
		item.textContent = formatClosedDate(date);
		const removeBtn = createEl('button', 'gm-admin-remove gm-closed-date-remove', 'Remover');
		removeBtn.type = 'button';
		removeBtn.dataset.removeClosedDateIndex = String(index);
		item.appendChild(removeBtn);
		list.appendChild(item);
	});
}

function addClosedDate() {
	const dateInput = document.getElementById('gm-closed-date');
	if (!(dateInput instanceof HTMLInputElement)) return;
	const value = dateInput.value;
	if (!value) {
		gmToast('Selecione uma data para adicionar.');
		return;
	}
	if (gmClosedDates.includes(value)) {
		gmToast('Essa data já está marcada como fechada.');
		return;
	}
	gmClosedDates.push(value);
	renderClosedDates();	
	aplicarPreview();
	dateInput.value = '';
}

function removeClosedDate(index) {
	if (index < 0 || index >= gmClosedDates.length) return;
	gmClosedDates.splice(index, 1);
	renderClosedDates();
	aplicarPreview();
}

function getFilterManualLabel(filter) {
	if (!filter.manualItems?.length) return '';
	return `Itens: ${filter.manualItems.join(', ')}`;
}

function parseManualItems(value) {
	return (value || '')
		.split(',')
		.map(item => item.trim())
		.filter(Boolean);
}

function renderFilterChips() {
	const preview = document.getElementById('gm-preview-opt-services');
	if (!preview) return;
	preview.innerHTML = '';
	if (!gmFilters.length) return;
	const wrapper = document.createElement('div');
	wrapper.className = 'gm-filter-chips';
	gmFilters.forEach((filter, index) => {
		const chip = document.createElement('span');
		chip.className = 'gm-filter-chip';
		chip.textContent = getFilterName(filter);
		chip.dataset.filterIndex = String(index);
		if (index === gmActiveFilterIndex) {
			chip.classList.add('active');
		}
		wrapper.appendChild(chip);
	});
	preview.appendChild(wrapper);
}

function renderFilterList() {
	const list = document.getElementById('gm-filter-list');
	if (!list) return;
	list.innerHTML = '';
	if (!gmFilters.length) {
		list.appendChild(createEl('div', 'gm-admin-empty', 'Nenhum filtro adicionado.'));
		return;
	}
	gmFilters.forEach((filter, index) => {
		const item = createEl('div', 'gm-filter-item');
		const label = createEl('span', 'gm-filter-item-label', getFilterLabel(filter));
		item.appendChild(label);
		const manualLabel = getFilterManualLabel(filter);
		if (manualLabel) {
			item.appendChild(createEl('span', 'gm-filter-item-sub', manualLabel));
		}
		const editBtn = createEl('button', 'gm-admin-edit', 'Editar');
		editBtn.type = 'button';
		editBtn.dataset.editFilterIndex = String(index);
		const removeBtn = createEl('button', 'gm-admin-remove', 'Remover');
		removeBtn.type = 'button';
		removeBtn.dataset.filterIndex = String(index);
		item.appendChild(editBtn);
		item.appendChild(removeBtn);
		list.appendChild(item);
	});
}

function clearFilterFields() {
	const filterName = document.getElementById('gm-filter-name');
	const filterValue = document.getElementById('gm-filter-value');
	const filterManual = document.getElementById('gm-filter-manual');
	if (filterName) filterName.value = '';
	if (filterValue) filterValue.value = '';
	if (filterManual) filterManual.value = '';
	setFilterEditMode(false);
}

function loadFilterIntoForm(index) {
	const filter = gmFilters[index];
	if (!filter) return;
	const name = document.getElementById('gm-filter-name');
	const value = document.getElementById('gm-filter-value');
	const manual = document.getElementById('gm-filter-manual');
	if (name) name.value = filter.name || '';
	if (value) value.value = filter.value || '';
	if (manual) manual.value = (filter.manualItems || []).join(', ');
	gmEditingFilterIndex = index;
	setFilterEditMode(true);
}

function setFilterEditMode(active) {
	const button = document.getElementById('gm-add-filter');
	if (!button) return;
	button.textContent = active ? 'Salvar filtro' : 'Adicionar filtro';
	const icon = document.createElement('i');
	icon.className = active ? 'fas fa-save' : 'fas fa-plus';
	button.innerHTML = '';
	button.appendChild(icon);
	button.appendChild(document.createTextNode(active ? ' Salvar filtro' : ' Adicionar filtro'));
	gmEditingFilterIndex = active ? gmEditingFilterIndex : -1;
}

function addFilter() {
	const name = document.getElementById('gm-filter-name')?.value?.trim() || '';
	const value = document.getElementById('gm-filter-value')?.value?.trim() || '';
	const manual = document.getElementById('gm-filter-manual')?.value || '';
	if (!name || !value) {
		gmToast('Informe nome e valor do filtro.');
		return;
	}
	const manualItems = parseManualItems(manual);
	const filterData = { name, value, manualItems };
	if (gmEditingFilterIndex >= 0) {
		gmFilters[gmEditingFilterIndex] = filterData;
		gmToast('Filtro atualizado.');
	} else {
		gmFilters.unshift(filterData);
		gmToast('Filtro adicionado.');
	}
	renderFilterList();
	renderFilterChips();
	clearFilterFields();
	setFilterEditMode(false);
}

function removeFilter(index) {
	if (index < 0 || index >= gmFilters.length) return;
	gmFilters.splice(index, 1);
	renderFilterList();
	renderFilterChips();
	gmToast('Filtro removido.');
}

/* =========================================================
   GALERIA DE FOTOS DO ITEM (upload múltiplo)
   ========================================================= */
function renderItemPhotosGrid() {
	const grid = document.getElementById('gm-item-photos-grid');
	if (!grid) return;
	grid.innerHTML = '';
	gmItemPhotosDraft.forEach((url, index) => {
		const thumb = createEl('div', 'gm-gallery-thumb');
		thumb.style.backgroundImage = `url('${url}')`;
		if (index === 0) thumb.appendChild(createEl('span', 'gm-gallery-thumb-cover', 'Capa'));
		const removeBtn = createEl('button', 'gm-gallery-thumb-remove', '×');
		removeBtn.type = 'button';
		removeBtn.setAttribute('aria-label', 'Remover foto');
		removeBtn.dataset.removePhotoIndex = String(index);
		thumb.appendChild(removeBtn);
		grid.appendChild(thumb);
	});
}

function removeItemPhoto(index) {
	if (index < 0 || index >= gmItemPhotosDraft.length) return;
	const [urlRemovida] = gmItemPhotosDraft.splice(index, 1);
	renderItemPhotosGrid();
	aplicarPreview();
	gmToast('Foto removida.', 'Desfazer', () => {
		gmItemPhotosDraft.splice(index, 0, urlRemovida);
		renderItemPhotosGrid();
		aplicarPreview();
	});
}

async function handleItemPhotoFiles(fileList) {
	const files = Array.from(fileList || []);
	if (!files.length) return;
	gmToast(files.length > 1 ? 'Enviando fotos...' : 'Enviando foto...');
	for (const file of files) {
		const resultado = await uploadArquivo(file);
		if (resultado?.url) {
			gmItemPhotosDraft.push(resultado.url);
		} else {
			gmToast(`Não foi possível enviar "${file.name}".`);
		}
	}
	renderItemPhotosGrid();
	aplicarPreview();
}

/* =========================================================
   VÍDEO DO ITEM (upload único)
   ========================================================= */
function renderItemVideoField() {
	const nameEl = document.getElementById('gm-item-video-name');
	const removeBtn = document.getElementById('gm-item-video-remove');
	if (nameEl) nameEl.textContent = gmItemVideoDraft ? 'Vídeo anexado ✓' : '';
	if (removeBtn) removeBtn.classList.toggle('gm-hidden', !gmItemVideoDraft);
}

async function handleItemVideoFile(file) {
	if (!file) return;
	gmToast('Enviando vídeo...');
	const resultado = await uploadArquivo(file);
	if (resultado?.url) {
		gmItemVideoDraft = resultado.url;
		gmToast('Vídeo anexado.');
	} else {
		gmToast('Não foi possível enviar o vídeo.');
	}
	renderItemVideoField();
	aplicarPreview();
}

function removeItemVideo() {
	gmItemVideoDraft = '';
	renderItemVideoField();
	aplicarPreview();
}

/* =========================================================
   PREÇO PROMOCIONAL (de / por)
   ========================================================= */
function updateDiscountHint() {
	const hint = document.getElementById('gm-item-discount-hint');
	if (!hint) return;
	const price = parsePrecoParaNumero(document.getElementById('gm-item-price')?.value || '');
	const priceOld = parsePrecoParaNumero(document.getElementById('gm-item-price-old')?.value || '');

	if (!priceOld) {
		hint.hidden = true;
		hint.classList.remove('is-invalid');
		return;
	}

	hint.hidden = false;
	if (priceOld <= price) {
		hint.classList.add('is-invalid');
		hint.textContent = 'O preço antes do desconto deve ser maior que o preço de venda.';
		return;
	}

	hint.classList.remove('is-invalid');
	const pct = Math.round((1 - price / priceOld) * 100);
	hint.textContent = `${pct}% de desconto para o cliente`;
}

/* =========================================================
   VARIAÇÕES DO ITEM (tamanho, cor, ... com estoque próprio)
   ========================================================= */
function renderVariationList() {
	const list = document.getElementById('gm-variation-list');
	if (!list) return;
	list.innerHTML = '';
	if (!gmVariationsDraft.length) return;

	gmVariationsDraft.forEach((variacao, index) => {
		const item = createEl('div', 'gm-variation-item');
		const label = createEl('span', 'gm-variation-item-label', `${variacao.tipo}: ${variacao.valor}`);
		const subParts = [`Estoque: ${variacao.estoque || 0}`];
		if (variacao.preco) subParts.push(formatPriceLabel(variacao.preco));
		label.appendChild(createEl('span', 'gm-variation-item-sub', subParts.join(' · ')));
		item.appendChild(label);

		const removeBtn = createEl('button', 'gm-admin-remove', 'Remover');
		removeBtn.type = 'button';
		removeBtn.dataset.removeVariationIndex = String(index);
		item.appendChild(removeBtn);

		list.appendChild(item);
	});
}

function addVariation() {
	const tipo = document.getElementById('gm-variation-type')?.value || 'Variação';
	const valor = document.getElementById('gm-variation-value')?.value?.trim() || '';
	const estoque = document.getElementById('gm-variation-stock')?.value?.trim() || '0';
	const preco = normalizePrice(document.getElementById('gm-variation-price')?.value || '');

	if (!valor) {
		gmToast('Informe o valor da variação (ex.: P, Azul).');
		return;
	}

	gmVariationsDraft.push({ tipo, valor, estoque, preco });
	renderVariationList();
	aplicarPreview();

	const valueInput = document.getElementById('gm-variation-value');
	const stockInput = document.getElementById('gm-variation-stock');
	const priceInput = document.getElementById('gm-variation-price');
	if (valueInput) valueInput.value = '';
	if (stockInput) stockInput.value = '';
	if (priceInput) priceInput.value = '';
	gmToast('Variação adicionada.');
}

function removeVariation(index) {
	if (index < 0 || index >= gmVariationsDraft.length) return;
	gmVariationsDraft.splice(index, 1);
	renderVariationList();
	aplicarPreview();
}

/* =========================================================
   UPLOAD GENÉRICO PARA CAMPOS DE IMAGEM (banner/vitrine/ícone)
   ========================================================= */
function bindImageUploadField(fileInputId, urlInputId) {
	const fileInput = document.getElementById(fileInputId);
	const urlInput = document.getElementById(urlInputId);
	if (!fileInput || !urlInput) return;

	fileInput.addEventListener('change', async () => {
		const file = fileInput.files?.[0];
		if (!file) return;
		gmToast('Enviando imagem...');
		const resultado = await uploadArquivo(file);
		if (resultado?.url) {
			urlInput.value = resultado.url;
			urlInput.dispatchEvent(new Event('input', { bubbles: true }));
			gmToast('Imagem enviada.');
		} else {
			gmToast('Não foi possível enviar a imagem.');
		}
		fileInput.value = '';
	});
}

function setSubcategoryCustomVisibility() {
	const select = document.getElementById('gm-item-subcategory');
	const wrap = document.getElementById('gm-item-subcategory-custom-wrap');
	if (!select || !wrap) return;
	const shouldShowCustom = select.value === 'Personalizada';
	wrap.classList.toggle('gm-hidden', !shouldShowCustom);
}

function refreshSubcategoryOptions(category, selectedValue = '') {
	const select = document.getElementById('gm-item-subcategory');
	if (!select) return;

	const previous = selectedValue || select.value || '';
	const options = getSubcategoriesByCategory(category);
	select.innerHTML = '';

	const baseOption = document.createElement('option');
	baseOption.value = '';
	baseOption.textContent = 'Selecione...';
	select.appendChild(baseOption);

	options.forEach(opt => {
		const optionEl = document.createElement('option');
		optionEl.value = opt;
		optionEl.textContent = opt;
		select.appendChild(optionEl);
	});

	const customOption = document.createElement('option');
	customOption.value = 'Personalizada';
	customOption.textContent = 'Personalizada';
	select.appendChild(customOption);

	if (previous && options.includes(previous)) {
		select.value = previous;
	} else if (previous && previous !== 'Personalizada') {
		select.value = 'Personalizada';
		const customInput = document.getElementById('gm-item-subcategory-custom');
		if (customInput) customInput.value = previous;
	} else {
		select.value = previous;
	}

	setSubcategoryCustomVisibility();
}

function getCurrentSubcategory() {
	const select = document.getElementById('gm-item-subcategory');
	const custom = document.getElementById('gm-item-subcategory-custom');
	if (!select) return '';
	if (select.value === 'Personalizada') {
		return custom?.value?.trim() || '';
	}
	return select.value || '';
}

function setEditMode(active) {
	const addBtn = document.getElementById('gm-add-item');
	if (addBtn) {
		const textos = obterPerfilLoja(gmStoreProfile).textos;
		const label = active ? textos.botaoSalvar : textos.botaoAdicionar;
		const icon = document.createElement('i');
		icon.className = active ? 'fas fa-save' : 'fas fa-plus';
		addBtn.innerHTML = '';
		addBtn.appendChild(icon);
		addBtn.appendChild(document.createTextNode(` ${label}`));
	}
	gmEditingIndex = active ? gmEditingIndex : -1;
}

function clearItemFields() {
	setEditMode(false);
	setFilterEditMode(false);
	const fields = [
		['gm-item-type', GM_DEFAULT.itemType],
		['gm-item-name', GM_DEFAULT.itemName],
		['gm-item-description', GM_DEFAULT.itemDescription],
		['gm-item-price', GM_DEFAULT.itemPrice],
		['gm-item-price-old', ''],
		['gm-item-category', GM_DEFAULT.itemCategory],
		['gm-item-subcategory-custom', GM_DEFAULT.itemSubcategoryCustom],
		['gm-item-brand', GM_DEFAULT.itemBrand],
		['gm-item-qty', GM_DEFAULT.itemQty],
		['gm-item-color', GM_DEFAULT.itemColor],
		['gm-item-voltage', GM_DEFAULT.itemVoltage],
		['gm-item-duration', GM_DEFAULT.itemDuration],
		['gm-open-time', GM_DEFAULT.openTime],
		['gm-close-time', GM_DEFAULT.closeTime],
	];

	fields.forEach(([id, value]) => {
		const el = document.getElementById(id);
		if (el) el.value = value;
	});

	const deliveryEl = document.getElementById('gm-item-delivery');
	const pickupEl = document.getElementById('gm-item-pickup');
	if (deliveryEl) deliveryEl.checked = GM_DEFAULT.itemDelivery;
	if (pickupEl) pickupEl.checked = GM_DEFAULT.itemPickup;

	gmItemPhotosDraft = [];
	gmItemVideoDraft = '';
	gmVariationsDraft = [];
	renderItemPhotosGrid();
	renderItemVideoField();
	renderVariationList();
	updateDiscountHint();

	refreshSubcategoryOptions(GM_DEFAULT.itemCategory, GM_DEFAULT.itemSubcategory);
	clearFilterFields();
	applyStoreProfileToItemForm();
}

function loadItemIntoForm(index) {
	const item = gmItems[index];
	if (!item) return;
	setEditMode(true);
	gmEditingIndex = index;

	const fields = {
		'gm-item-type': item.type,
		'gm-item-name': item.name,
		'gm-item-description': item.description,
		'gm-item-price': item.price,
		'gm-item-price-old': item.priceOld,
		'gm-item-category': item.category,
		'gm-item-brand': item.brand,
		'gm-item-qty': item.qty,
		'gm-item-color': item.color,
		'gm-item-voltage': item.voltage,
		'gm-item-duration': item.duration
	};

	Object.entries(fields).forEach(([id, value]) => {
		const el = document.getElementById(id);
		if (el) el.value = value || '';
	});

	refreshSubcategoryOptions(item.category, item.subcategory || '');
	const customInput = document.getElementById('gm-item-subcategory-custom');
	if (customInput) customInput.value = item.subcategory && item.subcategory !== document.getElementById('gm-item-subcategory')?.value ? item.subcategory : '';

	gmItemPhotosDraft = [...(item.fotos && item.fotos.length ? item.fotos : (item.photo ? [item.photo] : []))];
	gmItemVideoDraft = item.video || '';
	gmVariationsDraft = (item.variacoes || []).map(v => ({ ...v }));
	renderItemPhotosGrid();
	renderItemVideoField();
	renderVariationList();
	updateDiscountHint();

	const temDadosAvancados = gmVariationsDraft.length > 0 || item.brand || item.color || item.voltage || item.duration;
	if (temDadosAvancados && gmFormMode !== 'avancado') setFormMode('avancado');
}

function collectItemFromForm() {
	const type = document.getElementById('gm-item-type')?.value || 'produto';
	const name = document.getElementById('gm-item-name')?.value?.trim() || '';
	const description = document.getElementById('gm-item-description')?.value?.trim() || '';
	const price = normalizePrice(document.getElementById('gm-item-price')?.value || '');
	const priceOld = normalizePrice(document.getElementById('gm-item-price-old')?.value || '');
	const category = document.getElementById('gm-item-category')?.value?.trim() || '';
	const subcategory = getCurrentSubcategory();
	const brand = document.getElementById('gm-item-brand')?.value?.trim() || '';
	const qty = document.getElementById('gm-item-qty')?.value?.trim() || '';
	const color = document.getElementById('gm-item-color')?.value?.trim() || '';
	const voltage = document.getElementById('gm-item-voltage')?.value || '';
	const duration = document.getElementById('gm-item-duration')?.value?.trim() || '';
	const delivery = document.getElementById('gm-item-delivery')?.checked ?? true;
	const pickup = document.getElementById('gm-item-pickup')?.checked ?? true;

	if (!name) {
		gmToast('Informe o nome do item para cadastrar.');
		return null;
	}

	if (!description) {
		gmToast('Adicione a descricao do item.');
		return null;
	}

	if (!category) {
		gmToast('Selecione uma categoria para o item.');
		return null;
	}

	if (!subcategory) {
		gmToast('Selecione ou informe uma subcategoria.');
		return null;
	}

	if (priceOld && parsePrecoParaNumero(priceOld) <= parsePrecoParaNumero(price)) {
		gmToast('O preço antes do desconto deve ser maior que o preço de venda.');
		return null;
	}

	return {
		type, name, description, price, priceOld,
		photo: gmItemPhotosDraft[0] || '',
		fotos: [...gmItemPhotosDraft],
		video: gmItemVideoDraft,
		category, subcategory, brand, qty, color, voltage, duration, delivery, pickup,
		variacoes: gmVariationsDraft.map(v => ({ ...v })),
	};
}

function renderAdminItems() {
	const listEl = document.getElementById('gm-items-admin-list');
	if (!listEl) return;

	listEl.innerHTML = '';
	if (!gmItems.length) {
		listEl.appendChild(createEl('div', 'gm-admin-empty', 'Nenhum item cadastrado ainda.'));
		return;
	}

	gmItems.forEach((item, index) => {
		const card = createEl('article', 'gm-admin-item');

		const cover = createEl('div', 'gm-admin-item-cover');
		const capa = (item.fotos && item.fotos[0]) || item.photo;
		if (capa) {
			cover.style.backgroundImage = `url('${capa}')`;
		} else {
			cover.classList.add('gm-admin-item-cover-empty');
			cover.innerHTML = '<i class="fas fa-image"></i>';
		}
		card.appendChild(cover);

		const info = createEl('div', 'gm-admin-item-info');

		const head = createEl('div', 'gm-admin-item-head');
		head.appendChild(createEl('h6', 'gm-admin-item-title', item.name));
		const priceEl = createEl('span', 'gm-admin-item-price', formatPriceLabel(item.price));
		if (item.priceOld) priceEl.appendChild(createEl('span', 'gm-admin-item-price-old', formatPriceLabel(item.priceOld)));
		head.appendChild(priceEl);
		info.appendChild(head);

		const badges = createEl('div', 'gm-admin-item-badges');
		badges.appendChild(createEl('span', 'gm-item-badge', item.type === 'servico' ? 'Servico' : 'Produto'));
		if (item.priceOld) badges.appendChild(createEl('span', 'gm-item-badge gm-item-badge--promo', 'Promoção'));
		if (item.variacoes?.length) badges.appendChild(createEl('span', 'gm-item-badge gm-item-badge--variacoes', `${item.variacoes.length} variação(ões)`));
		if (item.fotos?.length > 1) badges.appendChild(createEl('span', 'gm-item-badge', `${item.fotos.length} fotos`));
		info.appendChild(badges);

		const metaParts = [
			item.category,
			item.subcategory,
			item.brand,
			item.qty ? `Qtd: ${item.qty}` : '',
			item.color ? `Cor: ${item.color}` : '',
			item.voltage,
			item.duration ? `${item.duration} min` : '',
		].filter(Boolean);
		if (metaParts.length) info.appendChild(createEl('p', 'gm-admin-item-meta', metaParts.join(' · ')));

		if (item.description) info.appendChild(createEl('p', 'gm-admin-item-desc', item.description));

		const actions = createEl('div', 'gm-admin-item-actions');
		const editBtn = createEl('button', 'gm-admin-edit');
		editBtn.type = 'button';
		editBtn.dataset.editIndex = String(index);
		editBtn.innerHTML = '<i class="fas fa-pen"></i> Editar';
		const removeBtn = createEl('button', 'gm-admin-remove');
		removeBtn.type = 'button';
		removeBtn.dataset.removeIndex = String(index);
		removeBtn.innerHTML = '<i class="fas fa-trash"></i> Remover';
		actions.appendChild(editBtn);
		actions.appendChild(removeBtn);
		info.appendChild(actions);

		card.appendChild(info);
		listEl.appendChild(card);
	});
}

function buildPreviewItem(item, itemIndex) {
	const card = createEl('article', 'gm-preview-item');
	const fotos = (item.fotos && item.fotos.length) ? item.fotos : (item.photo ? [item.photo] : []);

	if (fotos.length) {
		const wrap = createEl('div', 'gm-preview-item-photo-wrap');
		const activeIndex = gmPreviewSelectedFoto[itemIndex] || 0;
		const photo = createEl('div', 'gm-preview-item-photo');
		photo.style.backgroundImage = `url('${fotos[Math.min(activeIndex, fotos.length - 1)]}')`;
		wrap.appendChild(photo);

		if (fotos.length > 1) {
			const dots = createEl('div', 'gm-preview-item-dots');
			fotos.forEach((_, fotoIndex) => {
				const dot = createEl('button', `gm-preview-item-dot${fotoIndex === activeIndex ? ' active' : ''}`);
				dot.type = 'button';
				dot.setAttribute('aria-label', `Foto ${fotoIndex + 1}`);
				dot.dataset.itemIndex = String(itemIndex);
				dot.dataset.fotoIndex = String(fotoIndex);
				dots.appendChild(dot);
			});
			wrap.appendChild(dots);
		}
		card.appendChild(wrap);
	}

	if (item.video) {
		const video = document.createElement('video');
		video.className = 'gm-preview-item-video';
		video.src = item.video;
		video.controls = true;
		video.preload = 'metadata';
		card.appendChild(video);
	}

	const body = createEl('div', 'gm-preview-item-body');
	const row = createEl('div', 'gm-preview-item-title-row');
	const title = createEl('h6', 'gm-preview-item-title', item.name);
	const badge = createEl('span', 'gm-item-badge', item.type === 'servico' ? 'Servico' : 'Produto');
	row.appendChild(title);
	row.appendChild(badge);

	const price = createEl('p', 'gm-preview-item-price', formatPriceLabel(item.price));
	const precoNum = parsePrecoParaNumero(item.price);
	const precoOldNum = parsePrecoParaNumero(item.priceOld);
	if (precoOldNum > precoNum) {
		price.appendChild(createEl('span', 'gm-preview-item-price-old', formatPriceLabel(item.priceOld)));
		const pct = Math.round((1 - precoNum / precoOldNum) * 100);
		price.appendChild(createEl('span', 'gm-preview-item-discount-badge', `-${pct}%`));
	}

	let variacoesRow = null;
	if (item.variacoes?.length) {
		variacoesRow = createEl('div', 'gm-preview-item-variacoes');
		item.variacoes.forEach(variacao => {
			const chip = createEl('button', 'gm-preview-variacao-chip', `${variacao.valor}`);
			chip.type = 'button';
			chip.title = `${variacao.tipo}: ${variacao.valor}`;
			const semEstoque = Number(variacao.estoque) <= 0;
			if (semEstoque) chip.disabled = true;
			chip.addEventListener('click', (event) => {
				event.stopPropagation();
				if (semEstoque) return;
				variacoesRow.querySelectorAll('.gm-preview-variacao-chip').forEach(c => c.classList.remove('active'));
				chip.classList.add('active');
			});
			variacoesRow.appendChild(chip);
		});
	}

	const qtyWrapper = createEl('div', 'gm-preview-item-qty-row');
	const qtyLabel = createEl('span', 'gm-preview-item-qty-label', 'Qtd');
	const qtyInput = document.createElement('input');
	qtyInput.type = 'number';
	qtyInput.className = 'gm-preview-item-qty';
	qtyInput.min = '1';
	qtyInput.value = '1';
	qtyInput.max = item.qty ? String(item.qty) : '99';
	qtyInput.title = 'Quantidade a adicionar';
	qtyInput.addEventListener('pointerdown', (event) => event.stopPropagation());
	qtyInput.addEventListener('click', (event) => event.stopPropagation());
	qtyInput.addEventListener('focus', (event) => event.stopPropagation());
	qtyWrapper.appendChild(qtyLabel);
	qtyWrapper.appendChild(qtyInput);

	const actions = createEl('div', 'gm-preview-item-actions');
	const addButton = createEl('button', 'gm-preview-item-button', 'Adicionar no carrinho');
	addButton.type = 'button';
	addButton.addEventListener('click', (event) => {
		event.stopPropagation();
		const rawQty = Number(qtyInput.value);
		const availableQty = Number(item.qty) || 99;
		const quantity = rawQty > 0 ? Math.min(rawQty, availableQty) : 1;
		qtyInput.value = String(quantity);
		gmToast(`${quantity} x "${item.name}" adicionado ao carrinho.`);
	});
	actions.appendChild(qtyWrapper);
	actions.appendChild(addButton);

	body.appendChild(row);
	body.appendChild(price);

	if (item.category || item.subcategory || item.brand) {
		const meta1 = createEl('p', 'gm-preview-item-description',
			[
				item.category,
				item.subcategory ? `Subcategoria: ${item.subcategory}` : '',
				item.brand
			].filter(Boolean).join(' · ')
		);
		body.appendChild(meta1);
	}

	if (variacoesRow) body.appendChild(variacoesRow);

	body.appendChild(actions);

	const details = createEl('div', 'gm-preview-item-details');
	const detailDescription = createEl('p', 'gm-preview-item-description', item.description || 'Sem descrição.');
	details.appendChild(detailDescription);

	const deliveryNotes = [];
	if (item.delivery) deliveryNotes.push('Entrega disponível');
	if (item.pickup) deliveryNotes.push('Retirada disponível');
	if (item.qty) deliveryNotes.push(`Qtd: ${item.qty}`);
	if (item.color) deliveryNotes.push(`Cor: ${item.color}`);
	if (item.voltage) deliveryNotes.push(item.voltage);
	if (item.duration) deliveryNotes.push(`Duração: ${item.duration} min`);
	if (item.subcategory) deliveryNotes.push(`Subcategoria: ${item.subcategory}`);
	if (item.brand) deliveryNotes.push(item.brand);

	if (deliveryNotes.length) {
		const detailsLine = createEl('p', 'gm-preview-item-description gm-item-tags', deliveryNotes.join(' · '));
		details.appendChild(detailsLine);
	}

	if (item.matchedFilters?.length) {
		const filterLine = createEl('p', 'gm-preview-item-description gm-item-tags', `Filtros: ${item.matchedFilters.join(' | ')}`);
		details.appendChild(filterLine);
	}

	body.appendChild(details);
	card.appendChild(body);

	return card;
}

function getFilterMatches(item, filter) {
	const key = filter.value.toLowerCase();
	const categoryMatch = item.category?.toLowerCase().includes(key);
	const subcategoryMatch = item.subcategory?.toLowerCase().includes(key);
	const manualMatch = filter.manualItems?.some(manual => manual.toLowerCase() === item.name.toLowerCase());
	return categoryMatch || subcategoryMatch || manualMatch;
}

function renderPreviewItems() {
	const previewList = document.getElementById('gm-preview-items');
	if (!previewList) return;

	previewList.innerHTML = '';
	const filtered = gmItems.map((item, originalIndex) => {
		const matchedFilters = gmFilters
			.map((filter, index) => ({ filter, index }))
			.filter(({ filter }) => getFilterMatches(item, filter))
			.map(({ filter }) => getFilterName(filter));
		return {
			...item,
			matchedFilters,
			originalIndex
		};
	});

	let visible = filtered;
	if (gmActiveFilterIndex >= 0 && gmFilters[gmActiveFilterIndex]) {
		const activeFilter = gmFilters[gmActiveFilterIndex];
		visible = filtered.filter(item => getFilterMatches(item, activeFilter));
	}

	if (!visible.length) {
		previewList.appendChild(createEl('div', 'gm-preview-empty', 'Nenhum item visivel com o filtro selecionado.'));
		return;
	}

	visible.forEach(item => previewList.appendChild(buildPreviewItem(item, item.originalIndex)));
}

function aplicarPreview() {
	const name = document.getElementById('gm-app-name')?.value?.trim() || GM_DEFAULT.name;
	const storeCategory = document.getElementById('gm-store-category')?.value || '';
	const subtitle = document.getElementById('gm-app-subtitle')?.value?.trim() || GM_DEFAULT.subtitle;
	const address = document.getElementById('gm-address')?.value?.trim() || GM_DEFAULT.address;
	const addressUrl = document.getElementById('gm-address-url')?.value?.trim() || GM_DEFAULT.addressUrl;
	const primary = document.getElementById('gm-primary-color')?.value || GM_DEFAULT.primary;
	const accent = document.getElementById('gm-accent-color')?.value || GM_DEFAULT.accent;
	const banner = document.getElementById('gm-banner-url')?.value?.trim() || '';
	const card = document.getElementById('gm-card-url')?.value?.trim() || '';
	const icon = document.getElementById('gm-app-icon-url')?.value?.trim() || '';
	const cardMode = document.getElementById('gm-preview-card-mode')?.value || GM_DEFAULT.itemCardMode || 'portrait';
	const openTime = document.getElementById('gm-open-time')?.value || GM_DEFAULT.openTime;
	const closeTime = document.getElementById('gm-close-time')?.value || GM_DEFAULT.closeTime;
	const openDays = Array.from(document.querySelectorAll('input[name="gm-weekday"]:checked')).map(el => el.dataset.dayName || el.value);

	const phone = document.getElementById('gm-phone');
	if (phone) {
		phone.classList.toggle('gm-mode-landscape', cardMode === 'landscape');
		phone.classList.toggle('gm-mode-portrait', cardMode !== 'landscape');
		phone.style.setProperty('--gm-primary', primary);
		phone.style.setProperty('--gm-accent', accent);
	}

	const titleEl = document.getElementById('gm-preview-title');
	const subtitleEl = document.getElementById('gm-preview-subtitle');
	const addressEl = document.getElementById('gm-preview-address');

	if (titleEl) titleEl.textContent = name;

	const sidebarNomeEl = document.getElementById('gm-sidebar-loja-nome');
	if (sidebarNomeEl) sidebarNomeEl.textContent = name;
	setBgFromUrl(
		document.getElementById('gm-sidebar-icon'),
		icon,
		`linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`
	);
	if (subtitleEl) {
		subtitleEl.textContent = storeCategory
			? `${subtitle} • ${storeCategory}`
			: subtitle;
	}
	if (addressEl) {
		const addressText = addressEl.querySelector('span');
		if (addressText) addressText.textContent = address;
		addressEl.href = addressUrl || '#';
	}

	const scheduleEl = document.getElementById('gm-preview-schedule');
	if (scheduleEl) {
		const daysText = openDays.length ? openDays.join(' • ') : 'Fechado';
		const closedDatesText = gmClosedDates.map(formatClosedDate).join(', ');
		scheduleEl.innerHTML = `
			<p class="gm-preview-schedule-line"><strong>Horário:</strong> ${escapeHtml(openTime)} - ${escapeHtml(closeTime)}</p>
			<p class="gm-preview-schedule-line"><strong>Dias abertos:</strong> ${escapeHtml(daysText)}</p>
			${gmClosedDates.length ? `<p class="gm-preview-schedule-line gm-item-tags"><strong>Fechado em:</strong> ${escapeHtml(closedDatesText)}</p>` : ''}
		`;
	}

	setBgFromUrl(
		document.getElementById('gm-preview-banner'),
		banner,
		`linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`
	);

	setBgFromUrl(
		document.getElementById('gm-preview-app-icon'),
		icon,
		`linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`
	);

	renderFilterChips();
	renderPreviewItems();
	renderDashboardChecklist();
}

function resetForm() {
	const map = [
		['gm-app-name', GM_DEFAULT.name],
		['gm-store-category', GM_DEFAULT.storeCategory],
		['gm-app-subtitle', GM_DEFAULT.subtitle],
		['gm-address', GM_DEFAULT.address],
		['gm-address-url', GM_DEFAULT.addressUrl],
		['gm-primary-color', GM_DEFAULT.primary],
		['gm-accent-color', GM_DEFAULT.accent],
		['gm-banner-url', GM_DEFAULT.banner],
		['gm-card-url', GM_DEFAULT.card],
		['gm-app-icon-url', GM_DEFAULT.icon],
		['gm-open-time', GM_DEFAULT.openTime],
		['gm-close-time', GM_DEFAULT.closeTime],
		['gm-preview-card-mode', GM_DEFAULT.itemCardMode],
	];

	map.forEach(([id, value]) => {
		const el = document.getElementById(id);
		if (!el) return;
		if (el.type === 'checkbox') {
			el.checked = Boolean(value);
			return;
		}
		el.value = value;
	});

	document.querySelectorAll('input[name="gm-weekday"]').forEach(checkbox => {
		if (!(checkbox instanceof HTMLInputElement)) return;
		checkbox.checked = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].includes(checkbox.dataset.dayName || '');
	});

	gmItems = cloneDefaultItems();
	gmFilters = [...GM_DEFAULT.filters];
	gmClosedDates = [...GM_DEFAULT.closedDates];
	clearItemFields();
	renderAdminItems();
	renderFilterList();
	renderClosedDates();
	aplicarPreview();
}

function addItem() {
	const item = collectItemFromForm();
	if (!item) return;

	if (gmEditingIndex >= 0) {
		item.id = gmItems[gmEditingIndex]?.id;
		gmItems[gmEditingIndex] = item;
		gmToast('Item atualizado com sucesso.');
	} else {
		gmItems.unshift(item);
		gmToast('Item adicionado ao app.');
	}

	renderAdminItems();
	aplicarPreview();
	clearItemFields();
}

function removeItem(index) {
	if (index < 0 || index >= gmItems.length) return;
	gmItems.splice(index, 1);
	renderAdminItems();
	aplicarPreview();
	gmToast('Item removido.');
}

function setPreviewVisibility(visible) {
	const layout = document.querySelector('.gm-layout');
	if (!layout) return;
	gmPreviewVisible = visible;
	layout.classList.toggle('gm-layout--preview-hidden', !visible);
	layout.classList.toggle('gm-layout--preview-mode', visible);

	const previewTab = document.getElementById('gm-tab-preview');
	if (previewTab) {
		previewTab.dataset.previewVisible = visible ? 'true' : 'false';
	}
}

function bindPreviewControls() {
	setPreviewVisibility(false);
}

/* =========================================================
   BUSCA DE FUNÇÕES + AJUDA (header)
   ========================================================= */
const GM_SEARCH_INDEX = [
	{ label: 'Indicadores de vendas', secao: 'Painel', icon: 'fa-chart-line', tab: 'panel-painel', targetId: 'gm-dashboard-stats' },
	{ label: 'Filtro de período', secao: 'Painel', icon: 'fa-calendar', tab: 'panel-painel', targetId: 'gm-stats-periodo-de' },
	{ label: 'Avaliações da loja', secao: 'Painel', icon: 'fa-star', tab: 'panel-painel', targetId: 'gm-store-rating-card' },
	{ label: 'Mensagens e Interações', secao: 'Painel', icon: 'fa-comments', tab: 'panel-painel', targetId: 'gm-messages-drawer' },
	{ label: 'Complete sua loja (checklist)', secao: 'Painel', icon: 'fa-list-check', tab: 'panel-painel', targetId: 'gm-dashboard-checklist' },
	{ label: 'Pedidos pendentes', secao: 'Painel', icon: 'fa-bell', tab: 'panel-painel', targetId: 'gm-pendentes-badge' },
	{ label: 'Compras e Contratações', secao: 'Atividade', icon: 'fa-cash-register', tab: 'panel-atividade', targetId: 'gm-pedidos-list' },
	{ label: 'Dados da loja', secao: 'Loja', icon: 'fa-store', tab: 'panel-loja', targetId: 'gm-step-1' },
	{ label: 'Aparência e visual', secao: 'Loja', icon: 'fa-palette', tab: 'panel-loja', targetId: 'gm-step-2' },
	{ label: 'Horários de funcionamento', secao: 'Loja', icon: 'fa-clock', tab: 'panel-loja', targetId: 'gm-step-3' },
	{ label: 'Perfil da loja', secao: 'Loja', icon: 'fa-shapes', tab: 'panel-loja', targetId: 'gm-profile-picker' },
	{ label: 'Novo produto ou serviço', secao: 'Catálogo', icon: 'fa-plus', tab: 'panel-catalogo', targetId: 'gm-item-form' },
	{ label: 'Filtros da vitrine', secao: 'Catálogo', icon: 'fa-filter', tab: 'panel-catalogo', targetId: 'gm-filter-name' },
	{ label: 'Itens cadastrados', secao: 'Catálogo', icon: 'fa-boxes-stacked', tab: 'panel-catalogo', targetId: 'gm-items-admin-list' },
	{ label: 'Níveis de acesso', secao: 'Equipe', icon: 'fa-user-shield', tab: 'panel-equipe', targetId: 'gm-nivel-nome' },
	{ label: 'Funcionários', secao: 'Equipe', icon: 'fa-people-group', tab: 'panel-equipe', targetId: 'gm-funcionario-nome' },
	{ label: 'Entregadores da loja', secao: 'Entregadores', icon: 'fa-motorcycle', tab: 'panel-entregadores', targetId: 'gm-entregador-nome' },
	{ label: 'Prévia da loja', secao: 'Prévia', icon: 'fa-mobile-screen', tab: 'panel-preview', targetId: '' },
	{ label: 'Salvar loja', secao: 'Geral', icon: 'fa-check', tab: '', targetId: 'gm-save-btn' },
];

function normalizarBusca(texto) {
	return (texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function irParaResultadoBusca(item) {
	if (item.tab) {
		document.querySelector(`.gm-tab[aria-controls="${item.tab}"]`)?.click();
	}
	if (item.targetId) {
		const el = document.getElementById(item.targetId);
		if (el) {
			window.requestAnimationFrame(() => {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' });
				el.classList.add('gm-search-highlight');
				setTimeout(() => el.classList.remove('gm-search-highlight'), 1600);
				if (typeof el.focus === 'function') {
					try { el.focus({ preventScroll: true }); } catch { /* alguns elementos não são focáveis */ }
				}
			});
		}
	}
}

function fecharBuscaResultados() {
	const results = document.getElementById('gm-search-results');
	const box = document.querySelector('.gm-search-box');
	if (results) { results.hidden = true; results.innerHTML = ''; }
	if (box) box.classList.remove('expanded');
}

function bindSearchAndHelp() {
	const input = document.getElementById('gm-search-input');
	const results = document.getElementById('gm-search-results');
	const box = document.querySelector('.gm-search-box');
	const magnifier = box?.querySelector('i.fa-magnifying-glass');
	if (!input || !results) return;

	input.addEventListener('input', () => {
		const termo = normalizarBusca(input.value.trim());
		if (!termo) {
			results.hidden = true;
			results.innerHTML = '';
			return;
		}

		const encontrados = GM_SEARCH_INDEX.filter(item =>
			normalizarBusca(item.label).includes(termo) || normalizarBusca(item.secao).includes(termo)
		).slice(0, 8);

		results.innerHTML = '';
		if (!encontrados.length) {
			results.appendChild(createEl('div', 'gm-search-empty', 'Nenhuma função encontrada.'));
		} else {
			encontrados.forEach(item => {
				const btn = createEl('button', 'gm-search-result');
				btn.type = 'button';
				const textWrap = createEl('div', 'gm-search-result-text');
				textWrap.appendChild(createEl('span', 'gm-search-result-label', item.label));
				textWrap.appendChild(createEl('span', 'gm-search-result-section', item.secao));
				btn.innerHTML = `<i class="fas ${item.icon}"></i>`;
				btn.appendChild(textWrap);
				btn.addEventListener('click', () => {
					irParaResultadoBusca(item);
					input.value = '';
					fecharBuscaResultados();
				});
				results.appendChild(btn);
			});
		}
		results.hidden = false;
	});

	input.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			input.blur();
			fecharBuscaResultados();
		}
	});

	magnifier?.addEventListener('click', () => {
		if (!box.classList.contains('expanded')) {
			box.classList.add('expanded');
			input.focus();
		}
	});

	document.addEventListener('click', (event) => {
		if (box && !box.contains(event.target)) {
			fecharBuscaResultados();
		}
	});

	const helpBtn = document.getElementById('gm-help-btn');
	const helpPanel = document.getElementById('gm-help-panel');
	const helpClose = document.getElementById('gm-help-close');

	const fecharAjuda = () => {
		if (!helpPanel) return;
		helpPanel.hidden = true;
		helpBtn?.setAttribute('aria-expanded', 'false');
	};

	helpBtn?.addEventListener('click', () => {
		if (!helpPanel) return;
		const abrindo = helpPanel.hidden;
		helpPanel.hidden = !abrindo;
		helpBtn.setAttribute('aria-expanded', abrindo ? 'true' : 'false');
	});

	helpClose?.addEventListener('click', fecharAjuda);

	document.addEventListener('click', (event) => {
		if (helpPanel && !helpPanel.hidden && !helpPanel.contains(event.target) && event.target !== helpBtn && !helpBtn?.contains(event.target)) {
			fecharAjuda();
		}
	});
}

/* =========================================================
   ALTERAÇÕES NÃO SALVAS — avisa o lojista antes de sair da
   página (ou navegar para outra seção do site) se houver dados
   da loja/catálogo ainda não salvos.
   ========================================================= */
function marcarFormSujo() {
	gmFormSujo = true;
}

function abrirModalNaoSalvo(hrefDestino) {
	gmSaidaPendenteHref = hrefDestino;
	const modal = document.getElementById('gm-unsaved-modal');
	if (modal) modal.hidden = false;
}

function fecharModalNaoSalvo() {
	gmSaidaPendenteHref = null;
	const modal = document.getElementById('gm-unsaved-modal');
	if (modal) modal.hidden = true;
}

function bindRastreioAlteracoes() {
	const editor = document.querySelector('.gm-editor');
	if (!editor) return;
	const areasSalvas = '#panel-loja, #panel-catalogo';

	editor.addEventListener('input', (event) => {
		if (event.target instanceof HTMLElement && event.target.closest(areasSalvas)) marcarFormSujo();
	});
	editor.addEventListener('change', (event) => {
		if (event.target instanceof HTMLElement && event.target.closest(areasSalvas)) marcarFormSujo();
	});
	editor.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement) || !target.closest(areasSalvas)) return;
		const gatilho = target.closest('#gm-add-item, #gm-add-filter, #gm-add-closed-date, .gm-admin-remove');
		if (gatilho) marcarFormSujo();
	});
}

function bindSaidaComAlteracoes() {
	window.addEventListener('beforeunload', (event) => {
		if (!gmFormSujo) return;
		event.preventDefault();
		event.returnValue = '';
	});

	document.querySelectorAll('#header a[href]').forEach(link => {
		link.addEventListener('click', (event) => {
			if (!gmFormSujo) return;
			event.preventDefault();
			abrirModalNaoSalvo(link.href);
		});
	});

	document.getElementById('gm-unsaved-cancelar')?.addEventListener('click', fecharModalNaoSalvo);

	document.getElementById('gm-unsaved-sair')?.addEventListener('click', () => {
		const href = gmSaidaPendenteHref;
		gmFormSujo = false;
		fecharModalNaoSalvo();
		if (href) window.location.href = href;
	});

	document.getElementById('gm-unsaved-salvar')?.addEventListener('click', async (event) => {
		const btn = event.currentTarget;
		btn.disabled = true;
		await salvarLojaCompleta();
		btn.disabled = false;
		const href = gmSaidaPendenteHref;
		if (gmFormSujo) return; // salvar falhou: mantém o modal aberto
		fecharModalNaoSalvo();
		if (href) window.location.href = href;
	});
}

/* =========================================================
   NAVEGAÇÃO LATERAL (telas grandes): Gerenciamento/Operacional
   como duas sub-abas independentes — só uma fica aberta por vez,
   a menos que o lojista fixe alguma com o alfinete.
   ========================================================= */
function bindNavAccordions() {
	const accordions = Array.from(document.querySelectorAll('details.gm-nav-accordion'));
	if (!accordions.length) return;

	accordions.forEach(acc => {
		acc.addEventListener('toggle', () => {
			if (!acc.open) return;
			accordions.forEach(outra => {
				if (outra !== acc && outra.open && !outra.classList.contains('gm-nav-pinned')) {
					outra.open = false;
				}
			});
		});
	});

	document.querySelectorAll('.gm-nav-pin-btn').forEach(btn => {
		btn.addEventListener('click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			const alvo = document.getElementById(btn.dataset.pinTarget);
			if (!alvo) return;
			const fixado = alvo.classList.toggle('gm-nav-pinned');
			btn.setAttribute('aria-pressed', fixado ? 'true' : 'false');
		});
	});
}

function bindTabs() {
	const tabs = document.querySelectorAll('.gm-tab');
	const panels = document.querySelectorAll('.gm-tab-panel');

	tabs.forEach(tab => {
		tab.addEventListener('click', () => {
			const targetId = tab.getAttribute('aria-controls');

			tabs.forEach(t => {
				const isMatch = t.getAttribute('aria-controls') === targetId;
				t.classList.toggle('active', isMatch);
				t.setAttribute('aria-selected', isMatch ? 'true' : 'false');
			});
			panels.forEach(p => p.classList.add('gm-tab-panel--hidden'));

			const target = document.getElementById(targetId);
			if (target) target.classList.remove('gm-tab-panel--hidden');

			const parentAccordion = tab.closest('details.gm-nav-accordion');
			if (parentAccordion && !parentAccordion.open) parentAccordion.open = true;

			if (targetId === 'panel-preview') {
				setPreviewVisibility(true);
				document.querySelector('.gm-editor')?.scrollTo({ top: 0, behavior: 'smooth' });
				aplicarPreview();
			} else {
				setPreviewVisibility(false);
			}
		});
	});
}

function abrirMensagensDrawer() {
	document.getElementById('gm-messages-drawer')?.classList.add('open');
	document.getElementById('gm-messages-overlay')?.classList.add('active');
}

function fecharMensagensDrawer() {
	document.getElementById('gm-messages-drawer')?.classList.remove('open');
	document.getElementById('gm-messages-overlay')?.classList.remove('active');
	gmMensagemAbertaId = -1;
	gmComposerAnexos = [];
	renderMensagens();
}

function bindMessagesBubble() {
	document.getElementById('gm-messages-bubble')?.addEventListener('click', abrirMensagensDrawer);
	document.getElementById('gm-messages-close')?.addEventListener('click', fecharMensagensDrawer);
	document.getElementById('gm-messages-overlay')?.addEventListener('click', fecharMensagensDrawer);
}

function bindStepAccordion(form) {
	const steps = Array.from(form.querySelectorAll('details.gm-step'));
	if (!steps.length) return;

	// Estado inicial: apenas a etapa 1 aberta.
	steps.forEach((step, index) => {
		step.open = index === 0;
	});

	steps.forEach(step => {
		step.addEventListener('toggle', () => {
			if (step.open) {
				steps.forEach(other => {
					if (other !== step) other.open = false;
				});
				return;
			}

			const anyOpen = steps.some(other => other.open);
			if (!anyOpen) {
				step.open = true;
			}
		});
	});

	form.querySelectorAll('.gm-stepper a[href^="#gm-step-"]').forEach(link => {
		link.addEventListener('click', (event) => {
			event.preventDefault();
			const href = link.getAttribute('href');
			if (!href) return;

			const target = form.querySelector(href);
			if (!(target instanceof HTMLDetailsElement)) return;

			steps.forEach(step => {
				step.open = step === target;
			});

			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	});
}

function rotuloTipoPedido(tipo) {
	return tipo === 'servico' ? 'Contratação de serviço' : 'Compra de produto';
}

function buildPedidoSteps(pedido) {
	const etapas = getEtapasPedido(pedido.tipo);
	const steps = createEl('div', 'gm-pedido-steps');

	etapas.forEach((etapa, index) => {
		const isDone = index < pedido.etapaIndex;
		const isCurrent = index === pedido.etapaIndex;
		const stepEl = createEl('div', 'gm-pedido-step');
		if (isDone) stepEl.classList.add('is-done');
		if (isCurrent) stepEl.classList.add('is-current');

		const dot = createEl('span', 'gm-pedido-step-dot');
		if (isDone) {
			const icon = document.createElement('i');
			icon.className = 'fas fa-check';
			dot.appendChild(icon);
		} else {
			dot.textContent = String(index + 1);
		}

		stepEl.appendChild(dot);
		stepEl.appendChild(createEl('span', 'gm-pedido-step-label', etapa.label));
		steps.appendChild(stepEl);
	});

	return steps;
}

function buildPedidoActions(pedido) {
	const etapas = getEtapasPedido(pedido.tipo);
	const etapaAtual = etapas[pedido.etapaIndex];
	const actions = createEl('div', 'gm-pedido-actions');

	if (pedido.tipo === 'produto' && pedido.etapaIndex >= 1) {
		const verBtn = createEl('button', 'btn btn-outline', 'Ver etiqueta');
		verBtn.type = 'button';
		verBtn.dataset.action = 'ver-etiqueta';
		verBtn.dataset.pedidoId = String(pedido.id);
		const tagIcon = document.createElement('i');
		tagIcon.className = 'fas fa-tag';
		verBtn.prepend(tagIcon);
		actions.appendChild(verBtn);
	}

	if (etapaAtual.acao) {
		const avancarBtn = createEl('button', 'btn btn-primary', etapaAtual.acao);
		avancarBtn.type = 'button';
		avancarBtn.dataset.action = 'avancar-etapa';
		avancarBtn.dataset.pedidoId = String(pedido.id);
		const arrowIcon = document.createElement('i');
		arrowIcon.className = 'fas fa-arrow-right';
		avancarBtn.prepend(arrowIcon);
		actions.appendChild(avancarBtn);
	} else {
		actions.appendChild(createEl('span', 'gm-pedido-done-tag', 'Concluído'));
	}

	return actions;
}

function renderPedidos() {
	const list = document.getElementById('gm-pedidos-list');
	if (!list) return;

	list.innerHTML = '';
	if (!gmPedidos.length) {
		list.appendChild(createEl('div', 'gm-admin-empty', 'Nenhuma compra ou contratação ainda.'));
		return;
	}

	gmPedidos.forEach(pedido => {
		const etapas = getEtapasPedido(pedido.tipo);
		const isFinal = pedido.etapaIndex === etapas.length - 1;

		const card = createEl('article', `gm-pedido-item gm-pedido-item--${pedido.tipo}`);

		const head = createEl('div', 'gm-pedido-item-head');
		head.appendChild(createEl('span', `gm-pedido-badge gm-pedido-badge--${pedido.tipo}`, rotuloTipoPedido(pedido.tipo)));
		head.appendChild(createEl('span', `gm-pedido-status gm-pedido-status--${isFinal ? 'concluido' : 'andamento'}`, isFinal ? 'Concluído' : 'Em andamento'));
		card.appendChild(head);

		card.appendChild(createEl('h6', 'gm-pedido-item-title', pedido.item));
		card.appendChild(createEl('p', 'gm-pedido-item-meta', `${pedido.cliente} · ${formatPriceLabel(pedido.valor)} · ${pedido.quando}`));
		card.appendChild(buildPedidoSteps(pedido));
		card.appendChild(buildPedidoActions(pedido));

		list.appendChild(card);
	});
}

/* =========================================================
   ATIVIDADE RECENTE (coluna direita, telas grandes) — substitui
   a prévia do celular por algo útil em qualquer aba: os pedidos
   e contratações mais recentes, com atalho para a aba Atividade.
   ========================================================= */
function renderActivityPanel() {
	const list = document.getElementById('gm-activity-panel-list');
	if (!list) return;

	list.innerHTML = '';
	if (!gmPedidos.length) {
		list.appendChild(createEl('div', 'gm-admin-empty', 'Nenhuma atividade ainda.'));
		return;
	}

	gmPedidos.slice(0, 6).forEach(pedido => {
		const etapas = getEtapasPedido(pedido.tipo);
		const isFinal = pedido.etapaIndex === etapas.length - 1;

		const row = createEl('button', 'gm-activity-row');
		row.type = 'button';
		row.dataset.pedidoId = String(pedido.id);

		const top = createEl('div', 'gm-activity-row-top');
		const icon = createEl('span', `gm-activity-row-icon gm-activity-row-icon--${pedido.tipo}`);
		icon.innerHTML = `<i class="fas ${pedido.tipo === 'servico' ? 'fa-calendar-check' : 'fa-box'}"></i>`;
		top.appendChild(icon);
		top.appendChild(createEl('strong', 'gm-activity-row-title', pedido.item));
		row.appendChild(top);

		row.appendChild(createEl('span', 'gm-activity-row-meta', `${pedido.cliente} · ${formatPriceLabel(pedido.valor)} · ${pedido.quando}`));
		row.appendChild(createEl('span', `gm-activity-row-status gm-activity-row-status--${isFinal ? 'done' : 'pending'}`, isFinal ? 'Concluído' : 'Em andamento'));

		row.addEventListener('click', () => {
			document.querySelector('.gm-tab[aria-controls="panel-atividade"]')?.click();
		});

		list.appendChild(row);
	});
}

function avancarEtapaPedido(id) {
	const pedido = gmPedidos.find(p => p.id === id);
	if (!pedido) return;

	const etapas = getEtapasPedido(pedido.tipo);
	if (pedido.etapaIndex >= etapas.length - 1) return;

	pedido.etapaIndex += 1;
	const novaEtapa = etapas[pedido.etapaIndex];

	renderPedidos();
	renderActivityPanel();
	renderPainel();
	atualizarBadgeAtividade();
	gmToast(`Cliente notificado: "${novaEtapa.label}" — ${pedido.item}.`);
}

function verEtiquetaPedido(id) {
	const pedido = gmPedidos.find(p => p.id === id);
	if (!pedido) return;
	gmToast(`Abrindo etiqueta de envio de "${pedido.item}" (simulação).`);
}

function iniciaisNome(nome) {
	return (nome || '')
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map(parte => parte[0].toUpperCase())
		.join('');
}

function truncar(texto, max) {
	if (!texto || texto.length <= max) return texto || '';
	return `${texto.slice(0, max).trim()}…`;
}

function buildMensagemRow(msg) {
	const row = createEl('button', `gm-mensagem-row${msg.lida ? '' : ' is-unread'}`);
	row.type = 'button';
	row.dataset.action = 'abrir-mensagem';
	row.dataset.mensagemId = String(msg.id);

	row.appendChild(createEl('div', 'gm-mensagem-avatar', iniciaisNome(msg.cliente)));

	const body = createEl('div', 'gm-mensagem-row-body');
	const head = createEl('div', 'gm-mensagem-head');
	head.appendChild(createEl('strong', 'gm-mensagem-nome', msg.cliente));
	head.appendChild(createEl('span', 'gm-mensagem-quando', msg.quando));
	body.appendChild(head);
	body.appendChild(createEl('p', 'gm-mensagem-row-preview', truncar(msg.mensagem, 56)));
	body.appendChild(createEl('span', 'gm-mensagem-item-ref', `Sobre: ${msg.item}`));
	row.appendChild(body);

	if (!msg.lida) row.appendChild(createEl('span', 'gm-mensagem-row-dot'));

	return row;
}

function buildMensagensGrupo(titulo, mensagens) {
	const section = createEl('section', 'gm-mensagens-grupo');
	if (titulo) section.appendChild(createEl('h4', 'gm-mensagens-grupo-titulo', titulo));
	const rows = createEl('div', 'gm-mensagens-grupo-rows');
	if (!mensagens.length) {
		rows.appendChild(createEl('div', 'gm-admin-empty', 'Nada por aqui ainda.'));
	} else {
		mensagens.forEach(msg => rows.appendChild(buildMensagemRow(msg)));
	}
	section.appendChild(rows);
	return section;
}

function buildMensagensFiltro() {
	const wrap = createEl('div', 'gm-mensagens-filtro');
	[
		{ valor: 'compra', label: 'Compras', icon: 'fa-bag-shopping' },
		{ valor: 'interacao', label: 'Interações', icon: 'fa-comment-dots' },
	].forEach(({ valor, label, icon }) => {
		const btn = createEl('button', `gm-mensagens-filtro-btn${gmMensagensFiltro === valor ? ' active' : ''}`);
		btn.type = 'button';
		btn.dataset.action = 'filtrar-mensagens';
		btn.dataset.filtro = valor;
		btn.innerHTML = `<i class="fas ${icon}"></i> ${label}`;
		wrap.appendChild(btn);
	});
	return wrap;
}

function buildAnexoChip(anexo, removivel) {
	const chip = createEl('span', 'gm-anexo-chip');
	const icon = document.createElement('i');
	icon.className = `fas ${GM_TIPO_ANEXO_ICON[anexo.tipo] || 'fa-paperclip'}`;
	chip.appendChild(icon);
	chip.appendChild(document.createTextNode(anexo.nome));
	if (removivel) {
		const remove = createEl('button', 'gm-anexo-chip-remove', '×');
		remove.type = 'button';
		remove.dataset.action = 'remover-anexo-composer';
		remove.dataset.anexoNome = anexo.nome;
		chip.appendChild(remove);
	}
	return chip;
}

function buildChatBubble(texto, anexos, quando, direcao) {
	const bubble = createEl('div', `gm-chat-bubble gm-chat-bubble--${direcao}`);
	if (texto) bubble.appendChild(createEl('p', 'gm-chat-bubble-texto', texto));
	if (anexos?.length) {
		const anexosWrap = createEl('div', 'gm-mensagem-anexos');
		anexos.forEach(anexo => anexosWrap.appendChild(buildAnexoChip(anexo, false)));
		bubble.appendChild(anexosWrap);
	}
	if (quando) bubble.appendChild(createEl('span', 'gm-chat-bubble-hora', quando));
	return bubble;
}

function buildMensagemDetalhe(msg) {
	const wrap = createEl('div', 'gm-mensagem-detalhe');

	const back = createEl('button', 'gm-mensagem-detalhe-back', 'Voltar');
	back.type = 'button';
	back.dataset.action = 'fechar-mensagem';
	const backIcon = document.createElement('i');
	backIcon.className = 'fas fa-arrow-left';
	back.prepend(backIcon);
	wrap.appendChild(back);

	const head = createEl('div', 'gm-mensagem-detalhe-head');
	head.appendChild(createEl('div', 'gm-mensagem-avatar gm-mensagem-avatar--lg', iniciaisNome(msg.cliente)));
	const headInfo = createEl('div');
	headInfo.appendChild(createEl('strong', 'gm-mensagem-nome', msg.cliente));
	headInfo.appendChild(createEl('span', 'gm-mensagem-item-ref', `Sobre: ${msg.item}`));
	head.appendChild(headInfo);
	head.appendChild(createEl('span', `gm-mensagem-tipo-tag gm-mensagem-tipo-tag--${msg.tipo}`, msg.tipo === 'compra' ? 'Compra/contratação' : 'Interação'));
	wrap.appendChild(head);

	const chat = createEl('div', 'gm-chat');
	chat.appendChild(buildChatBubble(msg.mensagem, msg.anexosCliente, msg.quando, 'in'));
	(msg.respostas || []).forEach(resp => {
		chat.appendChild(buildChatBubble(resp.texto, resp.anexos, resp.quando, 'out'));
	});
	wrap.appendChild(chat);

	const form = createEl('div', 'gm-chat-composer');

	if (gmComposerAnexos.length) {
		const anexosWrap = createEl('div', 'gm-mensagem-anexos gm-mensagem-anexos--composer');
		gmComposerAnexos.forEach(anexo => anexosWrap.appendChild(buildAnexoChip(anexo, true)));
		form.appendChild(anexosWrap);
	}

	const inputRow = createEl('div', 'gm-chat-composer-row');

	const attachWrap = createEl('div', 'gm-composer-attach-wrap');
	const clipBtn = createEl('button', 'gm-composer-clip-btn');
	clipBtn.type = 'button';
	clipBtn.dataset.action = 'toggle-anexo-menu';
	const clipIcon = document.createElement('i');
	clipIcon.className = 'fas fa-paperclip';
	clipBtn.appendChild(clipIcon);
	attachWrap.appendChild(clipBtn);

	if (gmComposerMenuAberto) {
		const menu = createEl('div', 'gm-composer-attach-menu');
		[
			{ tipo: 'foto', icon: 'fa-image', label: 'Foto', accept: 'image/*' },
			{ tipo: 'video', icon: 'fa-video', label: 'Vídeo', accept: 'video/*' },
			{ tipo: 'documento', icon: 'fa-file-alt', label: 'Documento', accept: '.pdf,.doc,.docx,.txt' },
		].forEach(({ tipo, icon, label, accept }) => {
			const btn = createEl('button', 'gm-composer-attach-btn');
			btn.type = 'button';
			const btnIcon = document.createElement('i');
			btnIcon.className = `fas ${icon}`;
			btn.appendChild(btnIcon);
			btn.appendChild(document.createTextNode(` ${label}`));

			const input = document.createElement('input');
			input.type = 'file';
			input.accept = accept;
			input.hidden = true;
			input.dataset.anexoTipo = tipo;
			input.addEventListener('change', () => {
				if (input.files?.[0]) {
					gmComposerAnexos.push({ nome: input.files[0].name, tipo });
					gmComposerMenuAberto = false;
					renderMensagens();
				}
			});

			btn.addEventListener('click', () => input.click());
			menu.appendChild(btn);
			menu.appendChild(input);
		});
		attachWrap.appendChild(menu);
	}

	inputRow.appendChild(attachWrap);

	const textarea = document.createElement('textarea');
	textarea.rows = 1;
	textarea.className = 'gm-chat-composer-input';
	textarea.placeholder = 'Digite uma mensagem...';
	textarea.dataset.replyId = String(msg.id);
	textarea.value = gmComposerTexto;
	textarea.addEventListener('input', () => { gmComposerTexto = textarea.value; });
	textarea.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			enviarRespostaMensagem(msg.id);
		}
	});
	inputRow.appendChild(textarea);

	const enviarBtn = createEl('button', 'gm-chat-send-btn');
	enviarBtn.type = 'button';
	enviarBtn.dataset.action = 'enviar-resposta';
	enviarBtn.dataset.mensagemId = String(msg.id);
	const sendIcon = document.createElement('i');
	sendIcon.className = 'fas fa-paper-plane';
	enviarBtn.appendChild(sendIcon);
	inputRow.appendChild(enviarBtn);

	form.appendChild(inputRow);
	wrap.appendChild(form);

	return wrap;
}

function renderMensagens() {
	const list = document.getElementById('gm-mensagens-list');
	if (!list) return;

	list.innerHTML = '';

	// Telas pequenas: sem espaço para janelas flutuantes — a conversa aberta
	// ocupa o próprio painel de mensagens, como antes.
	if (!gmTelaGrande() && gmMensagemAbertaId >= 0) {
		const msg = gmMensagens.find(m => m.id === gmMensagemAbertaId);
		if (msg) {
			list.appendChild(buildMensagemDetalhe(msg));
			list.querySelector('textarea')?.focus();
			return;
		}
		gmMensagemAbertaId = -1;
	}

	list.appendChild(buildMensagensFiltro());

	if (!gmMensagens.length) {
		list.appendChild(createEl('div', 'gm-admin-empty', 'Nenhuma mensagem ainda.'));
		return;
	}

	const filtradas = gmMensagens.filter(m => m.tipo === gmMensagensFiltro);
	list.appendChild(buildMensagensGrupo('', filtradas));
}

function mapMensagemApi(m) {
	return {
		id: m.id,
		tipo: m.tipo,
		cliente: m.cliente_nome || 'Cliente',
		mensagem: m.texto,
		item: m.item_nome || '—',
		quando: tempoRelativo(m.criado_em),
		lida: Boolean(m.lida),
		anexosCliente: (m.anexos || []).map(a => ({ nome: a.nome_arquivo, tipo: a.tipo })),
		respostas: (m.respostas || []).map(r => ({ texto: r.texto, anexos: [], quando: tempoRelativo(r.criado_em) })),
	};
}

async function carregarMensagens() {
	if (!gmLojaId) return;
	const dados = await fetchMensagensLoja(gmLojaId);
	if (!Array.isArray(dados) || !dados.length) return; // sem mensagens reais ainda: mantém a conversa de teste
	gmMensagens = dados.map(mapMensagemApi);
	renderMensagens();
	atualizarBadgeAtividade();
}

function preencherFormularioLoja(loja) {
	const setValue = (id, value) => {
		const el = document.getElementById(id);
		if (el) el.value = value ?? '';
	};

	setValue('gm-app-name', loja.nome);
	setValue('gm-store-category', loja.categoria);
	setValue('gm-app-subtitle', loja.subtitulo);
	setValue('gm-address', loja.endereco);
	setValue('gm-address-url', loja.endereco_url);
	setValue('gm-primary-color', loja.cor_primaria);
	setValue('gm-accent-color', loja.cor_destaque);
	setValue('gm-banner-url', loja.banner_url);
	setValue('gm-card-url', loja.card_url);
	setValue('gm-app-icon-url', loja.icone_url);
	setValue('gm-preview-card-mode', loja.modo_card);
	setValue('gm-open-time', formatarHoraParaInput(loja.horario_abre));
	setValue('gm-close-time', formatarHoraParaInput(loja.horario_fecha));

	gmStoreProfile = obterPerfilLoja(loja.perfil).id;
	renderProfilePicker();
	applyStoreProfileToItemForm();
}

async function inicializarLojaGerenciamento() {
	const sessao = typeof contaObterSessao === 'function' ? contaObterSessao() : null;
	if (!sessao) {
		const layout = document.querySelector('.gm-layout');
		if (layout) layout.style.display = 'none';
		gmToast('Você precisa estar logado como lojista para acessar o painel de gerenciamento.');
		return;
	}

	const loja = await fetchLojaPorSlug('loja-central');
	if (!loja || loja.erro) return;
	gmLojaId = loja.id;

	preencherFormularioLoja(loja);

	gmItems = (loja.itens || []).map(mapItemApiParaLocal);
	gmItemsOriginalIds = gmItems.map(item => item.id);
	gmFilters = (loja.filtros || []).map(mapFiltroApiParaLocal);
	gmClosedDates = (loja.dias_fechados || []).map(d => (d.data || '').slice(0, 10));

	renderAdminItems();
	renderFilterList();
	renderClosedDates();
	aplicarPreview();

	await carregarMensagens();
}

async function salvarLojaCompleta() {
	if (!gmLojaId) {
		gmToast('Loja ainda não carregada. Tente novamente em instantes.');
		return;
	}
	if (gmSalvandoLoja) return;
	gmSalvandoLoja = true;

	try {
		const openTime = document.getElementById('gm-open-time')?.value || GM_DEFAULT.openTime;
		const closeTime = document.getElementById('gm-close-time')?.value || GM_DEFAULT.closeTime;

		const dadosLoja = {
			nome: document.getElementById('gm-app-name')?.value?.trim() || GM_DEFAULT.name,
			categoria: document.getElementById('gm-store-category')?.value || '',
			perfil: gmStoreProfile,
			subtitulo: document.getElementById('gm-app-subtitle')?.value?.trim() || '',
			endereco: document.getElementById('gm-address')?.value?.trim() || '',
			endereco_url: document.getElementById('gm-address-url')?.value?.trim() || '',
			cor_primaria: document.getElementById('gm-primary-color')?.value || GM_DEFAULT.primary,
			cor_destaque: document.getElementById('gm-accent-color')?.value || GM_DEFAULT.accent,
			banner_url: document.getElementById('gm-banner-url')?.value?.trim() || '',
			card_url: document.getElementById('gm-card-url')?.value?.trim() || '',
			icone_url: document.getElementById('gm-app-icon-url')?.value?.trim() || '',
			horario_abre: `${openTime}:00`,
			horario_fecha: `${closeTime}:00`,
			modo_card: document.getElementById('gm-preview-card-mode')?.value || 'portrait',
			filtros: gmFilters.map(f => ({ name: f.name, value: f.value, manualItems: f.manualItems || [] })),
			dias_fechados: [...gmClosedDates],
		};

		const resultadoLoja = await atualizarLoja(gmLojaId, dadosLoja);
		if (!resultadoLoja || resultadoLoja.erro) {
			gmToast('Não foi possível salvar a loja. Verifique sua conexão.');
			return;
		}

		const idsAtuais = new Set();
		await Promise.all(gmItems.map(async (item, i) => {
			const payload = mapItemLocalParaApi(item, gmLojaId);
			if (item.id) {
				await atualizarItem(item.id, payload);
				idsAtuais.add(item.id);
			} else {
				const criado = await criarItem(payload);
				if (criado?.id) {
					gmItems[i].id = criado.id;
					idsAtuais.add(criado.id);
				}
			}
		}));

		const removidos = gmItemsOriginalIds.filter(id => !idsAtuais.has(id));
		for (const id of removidos) {
			await removerItemApi(id);
		}
		gmItemsOriginalIds = [...idsAtuais];

		gmLojaSalvaAoMenosUmaVez = true;
		gmFormSujo = false;
		aplicarPreview();
		gmToast('Loja salva e publicada com sucesso.');
	} finally {
		gmSalvandoLoja = false;
	}
}

function filtrarMensagens(valor) {
	gmMensagensFiltro = valor;
	renderMensagens();
}

/* =========================================================
   ABRIR CONVERSA — em telas grandes vira uma janela flutuante
   (estilo Facebook); em telas pequenas, sem espaço para isso,
   continua abrindo em tela cheia dentro do painel de mensagens.
   ========================================================= */
function abrirMensagem(id) {
	if (gmTelaGrande()) {
		abrirChatFlutuante(id);
		return;
	}

	gmMensagemAbertaId = id;
	gmComposerAnexos = [];
	gmComposerTexto = '';
	gmComposerMenuAberto = false;

	const msg = gmMensagens.find(m => m.id === id);
	if (msg && !msg.lida) {
		msg.lida = true;
		if (id < 9000) marcarMensagemLida(id);
	}

	renderMensagens();
	atualizarBadgeAtividade();
}

function fecharMensagemDetalhe() {
	gmMensagemAbertaId = -1;
	gmComposerAnexos = [];
	gmComposerTexto = '';
	gmComposerMenuAberto = false;
	renderMensagens();
}

function toggleAnexoMenu() {
	gmComposerMenuAberto = !gmComposerMenuAberto;
	renderMensagens();
}

function removerAnexoComposer(nome) {
	gmComposerAnexos = gmComposerAnexos.filter(a => a.nome !== nome);
	renderMensagens();
}

async function enviarRespostaMensagem(id) {
	const texto = gmComposerTexto.trim();
	if (!texto && !gmComposerAnexos.length) {
		gmToast('Escreva uma resposta ou anexe um arquivo antes de enviar.');
		return;
	}

	const msg = gmMensagens.find(m => m.id === id);
	if (!msg) return;

	const ehMensagemDeTeste = id >= 9000; // conversa local de demonstração, sem registro real no backend
	if (!ehMensagemDeTeste) {
		const resultado = await responderMensagem(id, texto);
		if (!resultado) {
			gmToast('Não foi possível enviar a resposta. Tente novamente.');
			return;
		}
	}

	msg.respostas = msg.respostas || [];
	msg.respostas.push({ texto, anexos: gmComposerAnexos, quando: 'agora' });
	msg.lida = true;
	gmComposerAnexos = [];
	gmComposerTexto = '';
	gmComposerMenuAberto = false;

	renderMensagens();
	atualizarBadgeAtividade();
}

/* =========================================================
   JANELAS DE CHAT FLUTUANTES (inspiradas no Facebook, apenas
   telas grandes) — cada conversa aberta vira uma janela
   minimizável ancorada na base da página, lado a lado.
   ========================================================= */
function abrirChatFlutuante(id) {
	const msg = gmMensagens.find(m => m.id === id);
	if (!msg) return;

	if (!msg.lida) {
		msg.lida = true;
		if (id < 9000) marcarMensagemLida(id);
	}

	const janela = gmChatWindows.find(w => w.id === id);
	if (janela) {
		janela.minimizada = false;
	} else {
		gmChatWindows.push({ id, minimizada: false });
		if (gmChatWindows.length > GM_CHAT_MAX_JANELAS) gmChatWindows.shift();
	}

	renderChatDock();
	renderMensagens();
	atualizarBadgeAtividade();
}

function fecharChatFlutuante(id) {
	gmChatWindows = gmChatWindows.filter(w => w.id !== id);
	renderChatDock();
}

function alternarMinimizarChat(id) {
	const janela = gmChatWindows.find(w => w.id === id);
	if (janela) janela.minimizada = !janela.minimizada;
	renderChatDock();
}

async function enviarRespostaChatFlutuante(id, texto) {
	const msg = gmMensagens.find(m => m.id === id);
	if (!msg || !texto.trim()) return;

	const ehMensagemDeTeste = id >= 9000; // conversa local de demonstração, sem registro real no backend
	if (!ehMensagemDeTeste) {
		const resultado = await responderMensagem(id, texto.trim());
		if (!resultado) {
			gmToast('Não foi possível enviar a resposta. Tente novamente.');
			return;
		}
	}

	msg.respostas = msg.respostas || [];
	msg.respostas.push({ texto: texto.trim(), anexos: [], quando: 'agora' });

	renderChatDock();
	renderMensagens();
	atualizarBadgeAtividade();
}

function buildChatWindow(msg, janela) {
	const box = createEl('div', `gm-chat-window${janela.minimizada ? ' minimizada' : ''}`);

	const header = createEl('div', 'gm-chat-window-header');
	header.addEventListener('click', () => alternarMinimizarChat(msg.id));
	header.appendChild(createEl('span', 'gm-chat-window-avatar', iniciaisNome(msg.cliente)));
	const headText = createEl('div', 'gm-chat-window-headtext');
	headText.appendChild(createEl('strong', '', msg.cliente));
	headText.appendChild(createEl('span', '', msg.tipo === 'compra' ? 'Compra/contratação' : 'Interação'));
	header.appendChild(headText);

	const actions = createEl('div', 'gm-chat-window-actions');
	const minBtn = createEl('button', 'gm-chat-window-action');
	minBtn.type = 'button';
	minBtn.setAttribute('aria-label', janela.minimizada ? 'Expandir conversa' : 'Minimizar conversa');
	minBtn.innerHTML = `<i class="fas ${janela.minimizada ? 'fa-chevron-up' : 'fa-minus'}"></i>`;
	minBtn.addEventListener('click', (event) => { event.stopPropagation(); alternarMinimizarChat(msg.id); });
	actions.appendChild(minBtn);

	const closeBtn = createEl('button', 'gm-chat-window-action');
	closeBtn.type = 'button';
	closeBtn.setAttribute('aria-label', 'Fechar conversa');
	closeBtn.innerHTML = '<i class="fas fa-times"></i>';
	closeBtn.addEventListener('click', (event) => { event.stopPropagation(); fecharChatFlutuante(msg.id); });
	actions.appendChild(closeBtn);

	header.appendChild(actions);
	box.appendChild(header);

	if (!janela.minimizada) {
		const body = createEl('div', 'gm-chat-window-body');

		const thread = createEl('div', 'gm-chat-window-thread');
		thread.appendChild(buildChatBubble(msg.mensagem, msg.anexosCliente, msg.quando, 'in'));
		(msg.respostas || []).forEach(resp => thread.appendChild(buildChatBubble(resp.texto, resp.anexos, resp.quando, 'out')));
		body.appendChild(thread);

		const composer = createEl('div', 'gm-chat-window-composer');
		const textarea = document.createElement('textarea');
		textarea.rows = 1;
		textarea.placeholder = 'Escreva uma mensagem...';

		const enviar = () => {
			const texto = textarea.value;
			if (!texto.trim()) return;
			textarea.value = '';
			enviarRespostaChatFlutuante(msg.id, texto);
		};

		textarea.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				enviar();
			}
		});
		composer.appendChild(textarea);

		const sendBtn = createEl('button', 'gm-chat-window-send');
		sendBtn.type = 'button';
		sendBtn.setAttribute('aria-label', 'Enviar mensagem');
		sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
		sendBtn.addEventListener('click', enviar);
		composer.appendChild(sendBtn);

		body.appendChild(composer);
		box.appendChild(body);

		window.requestAnimationFrame(() => { thread.scrollTop = thread.scrollHeight; });
	}

	return box;
}

function renderChatDock() {
	const dock = document.getElementById('gm-chat-dock');
	if (!dock) return;
	dock.innerHTML = '';
	gmChatWindows.forEach(janela => {
		const msg = gmMensagens.find(m => m.id === janela.id);
		if (msg) dock.appendChild(buildChatWindow(msg, janela));
	});
}

function buildStatCard(icon, valor, label, cor = 'green') {
	const card = createEl('article', 'gm-stat-card');
	const iconEl = createEl('span', `gm-stat-icon gm-stat-icon--${cor}`);
	iconEl.innerHTML = `<i class="fas ${icon}"></i>`;
	card.appendChild(iconEl);
	const body = createEl('span', 'gm-stat-body');
	body.appendChild(createEl('strong', 'gm-stat-valor', String(valor)));
	body.appendChild(createEl('span', 'gm-stat-label', label));
	card.appendChild(body);
	return card;
}

/* =========================================================
   CHECKLIST "COMPLETE SUA LOJA" — efeito Zeigarnik: mostra o
   que falta para a loja ficar pronta, com base no estado atual
   do formulário (não depende de campos "obrigatórios" fixos).
   ========================================================= */
let gmLojaSalvaAoMenosUmaVez = false;

function getDashboardChecklistItems() {
	const banner = document.getElementById('gm-banner-url')?.value?.trim();
	const icone = document.getElementById('gm-app-icon-url')?.value?.trim();
	const primeiroItem = gmItems[0];

	return [
		{
			label: 'Adicione o ícone e o banner da sua loja',
			done: Boolean(banner && icone),
			action: () => document.querySelector('.gm-tab[aria-controls="panel-loja"]')?.click(),
		},
		{
			label: 'Cadastre seu primeiro produto ou serviço',
			done: gmItems.length > 0,
			action: () => document.querySelector('.gm-tab[aria-controls="panel-catalogo"]')?.click(),
		},
		{
			label: 'Adicione ao menos uma foto ao seu primeiro item',
			done: Boolean(primeiroItem && primeiroItem.fotos && primeiroItem.fotos.length > 0),
			action: () => document.querySelector('.gm-tab[aria-controls="panel-catalogo"]')?.click(),
		},
		{
			label: 'Salve as alterações para publicar sua loja',
			done: gmLojaSalvaAoMenosUmaVez,
			action: () => document.getElementById('gm-save-btn')?.click(),
		},
	];
}

function renderDashboardChecklist() {
	const wrap = document.getElementById('gm-dashboard-checklist');
	if (!wrap) return;

	const itens = getDashboardChecklistItems();
	const pendentes = itens.filter(i => !i.done);
	wrap.innerHTML = '';

	if (!pendentes.length) {
		wrap.appendChild(createEl('div', 'gm-checklist-complete', '✓ Sua loja está com o básico completo!'));
		return;
	}

	const card = createEl('article', 'gm-checklist-card');
	const head = createEl('div', 'gm-checklist-head');
	head.appendChild(createEl('h4', '', 'Complete sua loja'));
	head.appendChild(createEl('span', 'gm-checklist-progress', `${itens.length - pendentes.length}/${itens.length}`));
	card.appendChild(head);

	const list = createEl('div', 'gm-checklist-list');
	itens.forEach(item => {
		const row = createEl('button', `gm-checklist-item${item.done ? ' is-done' : ''}`);
		row.type = 'button';
		const check = createEl('span', 'gm-checklist-item-check');
		check.innerHTML = item.done ? '<i class="fas fa-check"></i>' : '';
		row.appendChild(check);
		row.appendChild(createEl('span', 'gm-checklist-item-label', item.label));
		row.addEventListener('click', item.action);
		list.appendChild(row);
	});
	card.appendChild(list);
	wrap.appendChild(card);
}

function buildRankingList(itens) {
	const list = createEl('div', 'gm-ranking-rows');
	if (!itens.length) {
		list.appendChild(createEl('div', 'gm-admin-empty', 'Sem dados ainda.'));
		return list;
	}
	const maior = Math.max(...itens.map(i => i.valor));
	itens.forEach((item, index) => {
		const row = createEl('div', 'gm-ranking-row');
		row.appendChild(createEl('span', 'gm-ranking-pos', `#${index + 1}`));
		const info = createEl('div', 'gm-ranking-info');
		info.appendChild(createEl('span', 'gm-ranking-nome', item.nome));
		const barTrack = createEl('div', 'gm-ranking-bar-track');
		const bar = createEl('div', 'gm-ranking-bar');
		bar.style.width = `${Math.round((item.valor / maior) * 100)}%`;
		barTrack.appendChild(bar);
		info.appendChild(barTrack);
		row.appendChild(info);
		row.appendChild(createEl('strong', 'gm-ranking-valor', String(item.valor)));
		list.appendChild(row);
	});
	return list;
}

/* =========================================================
   AVALIAÇÕES DA LOJA (coluna esquerda, acima de Mensagens)
   ========================================================= */
function renderStoreRatingCard() {
	const el = document.getElementById('gm-store-rating-card');
	if (!el) return;

	const dist = GM_AVALIACOES.distribuicao;
	const total = Object.values(dist).reduce((a, b) => a + b, 0);
	const soma = Object.entries(dist).reduce((acc, [nota, qtd]) => acc + Number(nota) * qtd, 0);
	const media = total ? soma / total : 0;
	const mediaLabel = media.toFixed(1).replace('.', ',');

	el.innerHTML = '';

	const head = createEl('div', 'gm-store-rating-head');

	const score = createEl('div', 'gm-store-rating-score');
	score.appendChild(createEl('strong', 'gm-store-rating-score-num', mediaLabel));
	const starsWrap = createEl('div', 'gm-store-rating-stars');
	starsWrap.setAttribute('aria-hidden', 'true');
	for (let i = 1; i <= 5; i += 1) {
		const icon = document.createElement('i');
		icon.className = i <= Math.round(media) ? 'fas fa-star' : 'far fa-star';
		starsWrap.appendChild(icon);
	}
	score.appendChild(starsWrap);
	head.appendChild(score);

	const headText = createEl('div', 'gm-store-rating-head-text');
	headText.appendChild(createEl('strong', '', 'Avaliações da loja'));
	headText.appendChild(createEl('span', '', `${total} avaliações de clientes`));
	head.appendChild(headText);

	el.appendChild(head);

	const bars = createEl('div', 'gm-store-rating-bars');
	[5, 4, 3, 2, 1].forEach(nota => {
		const qtd = dist[nota] || 0;
		const pct = total ? Math.round((qtd / total) * 100) : 0;
		const row = createEl('div', 'gm-store-rating-bar-row');
		row.appendChild(createEl('span', 'gm-store-rating-bar-label', `${nota} ★`));
		const track = createEl('div', 'gm-store-rating-bar-track');
		const fill = createEl('div', 'gm-store-rating-bar-fill');
		fill.style.width = `${pct}%`;
		track.appendChild(fill);
		row.appendChild(track);
		row.appendChild(createEl('span', 'gm-store-rating-bar-qtd', String(qtd)));
		bars.appendChild(row);
	});
	el.appendChild(bars);

	if (GM_AVALIACOES.recentes.length) {
		const recentesWrap = createEl('div', 'gm-store-rating-recentes');
		GM_AVALIACOES.recentes.slice(0, 2).forEach(rev => {
			const item = createEl('div', 'gm-store-rating-review');
			const reviewHead = createEl('div', 'gm-store-rating-review-head');
			reviewHead.appendChild(createEl('strong', '', rev.cliente));
			reviewHead.appendChild(createEl('span', 'gm-store-rating-review-stars', '★'.repeat(rev.nota) + '☆'.repeat(5 - rev.nota)));
			item.appendChild(reviewHead);
			item.appendChild(createEl('p', 'gm-store-rating-review-text', rev.comentario));
			recentesWrap.appendChild(item);
		});
		el.appendChild(recentesWrap);
	}
}

/* =========================================================
   EQUIPE — níveis de acesso e funcionários
   ========================================================= */
function renderNiveisAcesso() {
	const list = document.getElementById('gm-niveis-list');
	const select = document.getElementById('gm-funcionario-nivel');
	if (!list || !select) return;

	list.innerHTML = '';
	if (!gmNiveisAcesso.length) {
		list.appendChild(createEl('p', 'gm-empty-hint', 'Nenhum nível cadastrado ainda.'));
	}
	gmNiveisAcesso.forEach(nivel => {
		const card = createEl('article', 'gm-nivel-card');
		const info = createEl('div', 'gm-nivel-card-info');
		info.appendChild(createEl('strong', '', nivel.nome));
		const permsLabel = nivel.permissoes.map(p => GM_PERMISSOES_LABELS[p] || p).join(', ') || 'Nenhuma permissão';
		info.appendChild(createEl('span', 'gm-nivel-card-perms', permsLabel));
		card.appendChild(info);

		const removeBtn = createEl('button', 'gm-admin-remove', '');
		removeBtn.type = 'button';
		removeBtn.setAttribute('aria-label', `Remover nível ${nivel.nome}`);
		removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
		removeBtn.addEventListener('click', () => {
			const emUso = gmFuncionarios.some(f => f.nivelId === nivel.id);
			if (emUso) {
				gmToast('Este nível está em uso por um funcionário. Remova o funcionário primeiro.');
				return;
			}
			gmNiveisAcesso = gmNiveisAcesso.filter(n => n.id !== nivel.id);
			renderNiveisAcesso();
		});
		card.appendChild(removeBtn);
		list.appendChild(card);
	});

	const selecionado = select.value;
	select.innerHTML = '';
	if (!gmNiveisAcesso.length) {
		select.appendChild(createEl('option', '', 'Cadastre um nível primeiro'));
		select.disabled = true;
	} else {
		select.disabled = false;
		gmNiveisAcesso.forEach(nivel => {
			const opt = createEl('option', '', nivel.nome);
			opt.value = nivel.id;
			select.appendChild(opt);
		});
		if (gmNiveisAcesso.some(n => n.id === selecionado)) select.value = selecionado;
	}
}

function renderFuncionarios() {
	const list = document.getElementById('gm-funcionarios-list');
	if (!list) return;
	list.innerHTML = '';

	if (!gmFuncionarios.length) {
		list.appendChild(createEl('p', 'gm-empty-hint', 'Nenhum funcionário cadastrado ainda.'));
		return;
	}

	gmFuncionarios.forEach(func => {
		const nivel = gmNiveisAcesso.find(n => n.id === func.nivelId);
		const card = createEl('article', 'gm-funcionario-card');
		const info = createEl('div', 'gm-funcionario-card-info');
		info.appendChild(createEl('strong', '', func.nome));
		info.appendChild(createEl('span', '', func.contato || 'Sem contato informado'));
		card.appendChild(info);

		card.appendChild(createEl('span', 'gm-nivel-badge', nivel ? nivel.nome : 'Sem nível'));

		const removeBtn = createEl('button', 'gm-admin-remove', '');
		removeBtn.type = 'button';
		removeBtn.setAttribute('aria-label', `Remover funcionário ${func.nome}`);
		removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
		removeBtn.addEventListener('click', () => {
			gmFuncionarios = gmFuncionarios.filter(f => f.id !== func.id);
			renderFuncionarios();
			gmToast('Funcionário removido.');
		});
		card.appendChild(removeBtn);
		list.appendChild(card);
	});
}

function bindEquipe() {
	document.getElementById('gm-add-nivel')?.addEventListener('click', () => {
		const nomeInput = document.getElementById('gm-nivel-nome');
		const nome = nomeInput?.value.trim();
		if (!nome) {
			gmToast('Informe o nome do nível de acesso.');
			return;
		}
		const permissoes = Array.from(document.querySelectorAll('#gm-nivel-permissoes input[name="gm-permissao"]:checked')).map(el => el.value);
		gmNiveisAcesso.push({ id: `nivel-${Date.now()}`, nome, permissoes });
		nomeInput.value = '';
		document.querySelectorAll('#gm-nivel-permissoes input[name="gm-permissao"]').forEach(el => { el.checked = false; });
		renderNiveisAcesso();
		gmToast('Nível de acesso adicionado.');
	});

	document.getElementById('gm-add-funcionario')?.addEventListener('click', () => {
		const nomeInput = document.getElementById('gm-funcionario-nome');
		const contatoInput = document.getElementById('gm-funcionario-contato');
		const nivelSelect = document.getElementById('gm-funcionario-nivel');
		const nome = nomeInput?.value.trim();
		if (!nome) {
			gmToast('Informe o nome do funcionário.');
			return;
		}
		if (!gmNiveisAcesso.length || !nivelSelect?.value) {
			gmToast('Cadastre um nível de acesso antes de adicionar funcionários.');
			return;
		}
		gmFuncionarios.push({ id: `func-${Date.now()}`, nome, contato: contatoInput?.value.trim() || '', nivelId: nivelSelect.value });
		nomeInput.value = '';
		if (contatoInput) contatoInput.value = '';
		renderFuncionarios();
		gmToast('Funcionário adicionado.');
	});
}

/* =========================================================
   ENTREGADORES — entregadores próprios da loja
   ========================================================= */
const GM_VEICULO_LABELS = { moto: 'Moto', bike: 'Bicicleta', carro: 'Carro', a_pe: 'A pé' };
const GM_VEICULO_ICONS = { moto: 'fa-motorcycle', bike: 'fa-bicycle', carro: 'fa-car', a_pe: 'fa-person-walking' };

function renderEntregadores() {
	const list = document.getElementById('gm-entregadores-list');
	if (!list) return;
	list.innerHTML = '';

	if (!gmEntregadores.length) {
		list.appendChild(createEl('p', 'gm-empty-hint', 'Nenhum entregador cadastrado ainda.'));
		return;
	}

	gmEntregadores.forEach(entregador => {
		const card = createEl('article', 'gm-entregador-card');
		const icon = createEl('div', 'gm-entregador-card-icon');
		icon.innerHTML = `<i class="fas ${GM_VEICULO_ICONS[entregador.veiculo] || 'fa-motorcycle'}"></i>`;
		card.appendChild(icon);

		const info = createEl('div', 'gm-entregador-card-info');
		info.appendChild(createEl('strong', '', entregador.nome));
		info.appendChild(createEl('span', '', `${entregador.telefone || 'Sem telefone'} · ${GM_VEICULO_LABELS[entregador.veiculo] || entregador.veiculo}`));
		card.appendChild(info);

		const statusBtn = createEl('button', `gm-status-toggle ${entregador.ativo ? 'ativo' : 'inativo'}`, entregador.ativo ? 'Ativo' : 'Inativo');
		statusBtn.type = 'button';
		statusBtn.addEventListener('click', () => {
			entregador.ativo = !entregador.ativo;
			renderEntregadores();
		});
		card.appendChild(statusBtn);

		const removeBtn = createEl('button', 'gm-admin-remove', '');
		removeBtn.type = 'button';
		removeBtn.setAttribute('aria-label', `Remover entregador ${entregador.nome}`);
		removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
		removeBtn.addEventListener('click', () => {
			gmEntregadores = gmEntregadores.filter(e => e.id !== entregador.id);
			renderEntregadores();
			gmToast('Entregador removido.');
		});
		card.appendChild(removeBtn);
		list.appendChild(card);
	});
}

function bindEntregadores() {
	document.getElementById('gm-add-entregador')?.addEventListener('click', () => {
		const nomeInput = document.getElementById('gm-entregador-nome');
		const telefoneInput = document.getElementById('gm-entregador-telefone');
		const veiculoSelect = document.getElementById('gm-entregador-veiculo');
		const nome = nomeInput?.value.trim();
		if (!nome) {
			gmToast('Informe o nome do entregador.');
			return;
		}
		gmEntregadores.push({
			id: `entregador-${Date.now()}`,
			nome,
			telefone: telefoneInput?.value.trim() || '',
			veiculo: veiculoSelect?.value || 'moto',
			ativo: true,
		});
		nomeInput.value = '';
		if (telefoneInput) telefoneInput.value = '';
		renderEntregadores();
		gmToast('Entregador adicionado.');
	});
}

function getPedidosNoPeriodo() {
	const de = document.getElementById('gm-stats-periodo-de')?.value || '';
	const ate = document.getElementById('gm-stats-periodo-ate')?.value || '';
	if (!de && !ate) return gmPedidos;

	return gmPedidos.filter(pedido => {
		const mesPedido = (pedido.data || '').slice(0, 7);
		if (!mesPedido) return true;
		if (de && mesPedido < de) return false;
		if (ate && mesPedido > ate) return false;
		return true;
	});
}

function renderPainel() {
	renderDashboardChecklist();

	const statsEl = document.getElementById('gm-dashboard-stats');
	if (statsEl) {
		const pedidosPeriodo = getPedidosNoPeriodo();
		const vendasConcluidas = pedidosPeriodo.filter(p => p.etapaIndex >= getEtapasPedido(p.tipo).length - 1).length;
		const vendasPendentes = pedidosPeriodo.filter(p => p.etapaIndex < getEtapasPedido(p.tipo).length - 1).length;

		statsEl.innerHTML = '';
		statsEl.appendChild(buildStatCard('fa-bag-shopping', pedidosPeriodo.length, 'Vendas totais', 'blue'));
		statsEl.appendChild(buildStatCard('fa-check-circle', vendasConcluidas, 'Vendas concluídas', 'green'));
		statsEl.appendChild(buildStatCard('fa-hourglass-half', vendasPendentes, 'Vendas pendentes', 'amber'));
		statsEl.appendChild(buildStatCard('fa-cart-plus', GM_DASHBOARD.carrinhoUsuarios, 'Usuários com item no carrinho', 'blue'));

		const pendentesGeral = gmPedidos.filter(p => p.etapaIndex < getEtapasPedido(p.tipo).length - 1).length;
		const pendentesBadge = document.getElementById('gm-pendentes-badge');
		if (pendentesBadge) {
			pendentesBadge.textContent = String(pendentesGeral);
			pendentesBadge.hidden = pendentesGeral === 0;
		}
	}

	const curtidosEl = document.getElementById('gm-ranking-curtidos');
	if (curtidosEl) {
		curtidosEl.innerHTML = '';
		curtidosEl.appendChild(buildRankingList(GM_DASHBOARD.produtosMaisCurtidos));
	}

	const compradosEl = document.getElementById('gm-ranking-comprados');
	if (compradosEl) {
		compradosEl.innerHTML = '';
		compradosEl.appendChild(buildRankingList(GM_DASHBOARD.produtosMaisComprados));
	}
}

function atualizarBadgeAtividade() {
	const naoLidas = gmMensagens.filter(m => !m.lida).length;
	const pendentes = gmPedidos.filter(p => p.etapaIndex < getEtapasPedido(p.tipo).length - 1).length;

	const setBadge = (selector, valor) => {
		document.querySelectorAll(selector).forEach(el => {
			el.textContent = String(valor);
			el.hidden = valor === 0;
		});
	};

	setBadge('.js-atividade-badge', pendentes);
	setBadge('#gm-messages-bubble-badge', naoLidas);
}

function bindGerenciamento() {
	const form = document.getElementById('gm-form');
	if (!form) return;

	gmItems = cloneDefaultItems();
	gmFilters = [...GM_DEFAULT.filters];
	gmClosedDates = [...GM_DEFAULT.closedDates];
	gmPedidos = GM_PEDIDOS.map(pedido => ({ ...pedido }));
	renderAdminItems();
	renderFilterList();
	renderClosedDates();
	renderPedidos();
	renderActivityPanel();
	renderMensagens();
	renderPainel();
	renderStoreRatingCard();
	renderNiveisAcesso();
	renderFuncionarios();
	renderEntregadores();
	bindEquipe();
	bindEntregadores();
	atualizarBadgeAtividade();
	renderProfilePicker();
	applyStoreProfileToItemForm();
	applyFormModeToItemForm();

	document.getElementById('gm-profile-picker')?.addEventListener('change', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLInputElement) || target.name !== 'gm-store-profile') return;
		setStoreProfile(target.value);
	});

	document.querySelectorAll('.gm-mode-btn').forEach(btn => {
		btn.addEventListener('click', () => setFormMode(btn.dataset.formMode));
	});

	document.querySelectorAll('[data-quick-action]').forEach(btn => {
		btn.addEventListener('click', () => {
			if (btn.dataset.quickAction === 'add-item') {
				document.querySelector('.gm-tab[aria-controls="panel-catalogo"]')?.click();
			} else if (btn.dataset.quickAction === 'ver-pedidos') {
				document.querySelector('.gm-tab[aria-controls="panel-atividade"]')?.click();
			}
		});
	});

	['gm-stats-periodo-de', 'gm-stats-periodo-ate'].forEach(id => {
		document.getElementById(id)?.addEventListener('change', renderPainel);
	});

	refreshSubcategoryOptions(GM_DEFAULT.itemCategory, GM_DEFAULT.itemSubcategory);
	inicializarLojaGerenciamento();

	document.getElementById('gm-pedidos-list')?.addEventListener('click', event => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const btn = target.closest('button[data-action]');
		if (!btn) return;
		const id = Number(btn.dataset.pedidoId);
		if (!id) return;
		if (btn.dataset.action === 'avancar-etapa') avancarEtapaPedido(id);
		if (btn.dataset.action === 'ver-etiqueta') verEtiquetaPedido(id);
	});

	document.getElementById('gm-mensagens-list')?.addEventListener('click', event => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const btn = target.closest('button[data-action], [role="button"][data-action]');
		if (!btn) return;
		const action = btn.dataset.action;
		const id = Number(btn.dataset.mensagemId);
		if (action === 'abrir-mensagem' && id) abrirMensagem(id);
		if (action === 'fechar-mensagem') fecharMensagemDetalhe();
		if (action === 'enviar-resposta' && id) enviarRespostaMensagem(id);
		if (action === 'remover-anexo-composer') removerAnexoComposer(btn.dataset.anexoNome);
		if (action === 'toggle-anexo-menu') toggleAnexoMenu();
		if (action === 'filtrar-mensagens') filtrarMensagens(btn.dataset.filtro);
	});

	bindMessagesBubble();

	form.querySelectorAll('input, textarea, select').forEach(field => {
		field.addEventListener('input', aplicarPreview);
		field.addEventListener('change', aplicarPreview);
	});

	document.getElementById('gm-item-category')?.addEventListener('change', () => {
		refreshSubcategoryOptions(document.getElementById('gm-item-category')?.value || '', '');
		aplicarPreview();
	});

	document.getElementById('gm-item-subcategory')?.addEventListener('change', () => {
		setSubcategoryCustomVisibility();
		aplicarPreview();
	});

	document.getElementById('gm-add-filter')?.addEventListener('click', addFilter);
	document.getElementById('gm-clear-filter-fields')?.addEventListener('click', () => {
		clearFilterFields();
		gmToast('Campos de filtro limpos.');
	});

	document.getElementById('gm-filter-list')?.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const editBtn = target.closest('[data-edit-filter-index]');
		if (editBtn) {
			const index = Number(editBtn.getAttribute('data-edit-filter-index'));
			if (!Number.isNaN(index)) loadFilterIntoForm(index);
			return;
		}
		const removeBtn = target.closest('[data-filter-index]');
		if (!removeBtn) return;
		const index = Number(removeBtn.getAttribute('data-filter-index'));
		if (Number.isNaN(index)) return;
		removeFilter(index);
	});

	document.getElementById('gm-add-closed-date')?.addEventListener('click', addClosedDate);
	document.getElementById('gm-closed-dates-list')?.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const removeBtn = target.closest('[data-remove-closed-date-index]');
		if (!removeBtn) return;
		const index = Number(removeBtn.getAttribute('data-remove-closed-date-index'));
		if (Number.isNaN(index)) return;
		removeClosedDate(index);
	});

	document.getElementById('gm-preview-opt-services')?.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const chip = target.closest('.gm-filter-chip');
		if (!chip) return;
		const index = Number(chip.dataset.filterIndex);
		if (Number.isNaN(index)) return;
		gmActiveFilterIndex = index === gmActiveFilterIndex ? -1 : index;
		renderFilterChips();
		renderPreviewItems();
	});

	document.getElementById('gm-preview-items')?.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const dot = target.closest('.gm-preview-item-dot');
		if (dot) {
			event.stopPropagation();
			const itemIndex = Number(dot.dataset.itemIndex);
			const fotoIndex = Number(dot.dataset.fotoIndex);
			if (!Number.isNaN(itemIndex) && !Number.isNaN(fotoIndex)) {
				gmPreviewSelectedFoto[itemIndex] = fotoIndex;
				renderPreviewItems();
			}
			return;
		}
		const button = target.closest('.gm-preview-item-button, .gm-preview-variacao-chip');
		if (button) return;
		const itemCard = target.closest('.gm-preview-item');
		if (!itemCard) return;
		itemCard.classList.toggle('expanded');
	});

	document.getElementById('gm-add-item')?.addEventListener('click', addItem);
	document.getElementById('gm-clear-item-fields')?.addEventListener('click', () => {
		clearItemFields();
		gmToast('Campos do item limpos.');
	});

	document.getElementById('gm-items-admin-list')?.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;

		const editBtn = target.closest('[data-edit-index]');
		if (editBtn) {
			const index = Number(editBtn.getAttribute('data-edit-index'));
			if (!Number.isNaN(index)) loadItemIntoForm(index);
			return;
		}

		const removeBtn = target.closest('[data-remove-index]');
		if (!removeBtn) return;
		const index = Number(removeBtn.getAttribute('data-remove-index'));
		if (Number.isNaN(index)) return;
		removeItem(index);
	});

	document.getElementById('gm-save-btn')?.addEventListener('click', async (event) => {
		const btn = event.currentTarget;
		aplicarPreview();
		btn.disabled = true;
		await salvarLojaCompleta();
		btn.disabled = false;
	});

	// ── Galeria de fotos do item ──
	document.getElementById('gm-item-photo-file')?.addEventListener('change', (event) => {
		handleItemPhotoFiles(event.target.files);
		event.target.value = '';
	});
	document.getElementById('gm-item-photos-grid')?.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const removeBtn = target.closest('[data-remove-photo-index]');
		if (!removeBtn) return;
		const index = Number(removeBtn.getAttribute('data-remove-photo-index'));
		if (Number.isNaN(index)) return;
		removeItemPhoto(index);
	});

	// ── Vídeo do item ──
	document.getElementById('gm-item-video-file')?.addEventListener('change', (event) => {
		handleItemVideoFile(event.target.files?.[0]);
		event.target.value = '';
	});
	document.getElementById('gm-item-video-remove')?.addEventListener('click', removeItemVideo);

	// ── Preço promocional ──
	['gm-item-price', 'gm-item-price-old'].forEach(id => {
		document.getElementById(id)?.addEventListener('input', updateDiscountHint);
	});

	// ── Variações ──
	document.getElementById('gm-add-variation')?.addEventListener('click', addVariation);
	document.getElementById('gm-variation-list')?.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const removeBtn = target.closest('[data-remove-variation-index]');
		if (!removeBtn) return;
		const index = Number(removeBtn.getAttribute('data-remove-variation-index'));
		if (Number.isNaN(index)) return;
		removeVariation(index);
	});

	// ── Upload de imagens da loja (banner/vitrine/ícone) ──
	bindImageUploadField('gm-banner-file', 'gm-banner-url');
	bindImageUploadField('gm-card-file', 'gm-card-url');
	bindImageUploadField('gm-icon-file', 'gm-app-icon-url');

	bindStepAccordion(form);
	const itemForm = document.getElementById('gm-item-form');
	if (itemForm) bindStepAccordion(itemForm);
	bindPreviewControls();
	aplicarPreview();
}

function bindHamburgerGerenciamento() {
	const btn = document.getElementById('hamburger');
	const nav = document.getElementById('nav');
	if (!btn || !nav) return;

	btn.addEventListener('click', () => {
		btn.classList.toggle('active');
		nav.classList.toggle('open');
	});

	nav.querySelectorAll('.nav-link').forEach(link => {
		link.addEventListener('click', () => {
			btn.classList.remove('active');
			nav.classList.remove('open');
		});
	});
}

document.addEventListener('DOMContentLoaded', () => {
	bindTabs();
	bindGerenciamento();
	bindHamburgerGerenciamento();
	bindSearchAndHelp();
	bindRastreioAlteracoes();
	bindSaidaComAlteracoes();
	bindNavAccordions();
});
