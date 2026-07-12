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
	itemDelivery: true,
	itemPickup: true,
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
			photo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
			video: '',
			category: 'Alimentação',
			subcategory: 'Combo',
			brand: '',
			qty: '5',
			color: '',
			voltage: '',
			delivery: true,
			pickup: true
		},
		{
			type: 'servico',
			name: 'Instalacao Residencial',
			description: 'Servico tecnico com atendimento no mesmo dia.',
			price: '120,00',
			photo: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
			video: '',
			category: 'Serviços Gerais',
			subcategory: 'Instalação',
			brand: '',
			qty: '',
			color: '',
			voltage: '',
			delivery: false,
			pickup: true
		}
	]
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

let gmItems = [];
let gmEditingIndex = -1;
let gmFilters = [];
let gmActiveFilterIndex = -1;
let gmEditingFilterIndex = -1;
let gmClosedDates = [];
let gmPreviewVisible = false;

function gmToast(msg) {
	const el = document.getElementById('toast');
	if (!el) return;
	el.textContent = msg;
	el.classList.add('show');
	setTimeout(() => el.classList.remove('show'), 2300);
}

function setBgFromUrl(el, url, fallbackGradient) {
	if (!el) return;
	if (url) {
		el.style.backgroundImage = `url('${url}')`;
		return;
	}
	el.style.backgroundImage = fallbackGradient;
}

function cloneDefaultItems() {
	return GM_DEFAULT.items.map(item => ({ ...item }));
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
		addBtn.textContent = active ? 'Salvar item' : 'Adicionar item';
		const icon = document.createElement('i');
		icon.className = active ? 'fas fa-save' : 'fas fa-plus';
		addBtn.innerHTML = '';
		addBtn.appendChild(icon);
		addBtn.appendChild(document.createTextNode(active ? ' Salvar item' : ' Adicionar item'));
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
		['gm-item-photo', GM_DEFAULT.itemPhoto],
		['gm-item-video', GM_DEFAULT.itemVideo],
		['gm-item-category', GM_DEFAULT.itemCategory],
		['gm-item-subcategory-custom', GM_DEFAULT.itemSubcategoryCustom],
		['gm-item-brand', GM_DEFAULT.itemBrand],
		['gm-item-qty', GM_DEFAULT.itemQty],
		['gm-item-color', GM_DEFAULT.itemColor],
		['gm-item-voltage', GM_DEFAULT.itemVoltage],
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

	refreshSubcategoryOptions(GM_DEFAULT.itemCategory, GM_DEFAULT.itemSubcategory);
	clearFilterFields();
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
		'gm-item-photo': item.photo,
		'gm-item-video': item.video,
		'gm-item-category': item.category,
		'gm-item-brand': item.brand,
		'gm-item-qty': item.qty,
		'gm-item-color': item.color,
		'gm-item-voltage': item.voltage
	};

	Object.entries(fields).forEach(([id, value]) => {
		const el = document.getElementById(id);
		if (el) el.value = value || '';
	});

	refreshSubcategoryOptions(item.category, item.subcategory || '');
	const customInput = document.getElementById('gm-item-subcategory-custom');
	if (customInput) customInput.value = item.subcategory && item.subcategory !== document.getElementById('gm-item-subcategory')?.value ? item.subcategory : '';
}

function collectItemFromForm() {
	const type = document.getElementById('gm-item-type')?.value || 'produto';
	const name = document.getElementById('gm-item-name')?.value?.trim() || '';
	const description = document.getElementById('gm-item-description')?.value?.trim() || '';
	const price = normalizePrice(document.getElementById('gm-item-price')?.value || '');
	const photo = document.getElementById('gm-item-photo')?.value?.trim() || '';
	const video = document.getElementById('gm-item-video')?.value?.trim() || '';
	const category = document.getElementById('gm-item-category')?.value?.trim() || '';
	const subcategory = getCurrentSubcategory();
	const brand = document.getElementById('gm-item-brand')?.value?.trim() || '';
	const qty = document.getElementById('gm-item-qty')?.value?.trim() || '';
	const color = document.getElementById('gm-item-color')?.value?.trim() || '';
	const voltage = document.getElementById('gm-item-voltage')?.value || '';
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

	return { type, name, description, price, photo, video, category, subcategory, brand, qty, color, voltage, delivery, pickup };
}

function createEl(tag, className, text) {
	const el = document.createElement(tag);
	if (className) el.className = className;
	if (typeof text === 'string') el.textContent = text;
	return el;
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
		const head = createEl('div', 'gm-admin-item-head');
		const title = createEl('h6', 'gm-admin-item-title', item.name);
		const badge = createEl('span', 'gm-item-badge', item.type === 'servico' ? 'Servico' : 'Produto');
		const actions = createEl('div', 'gm-admin-item-actions');
		const editBtn = createEl('button', 'gm-admin-edit', 'Editar');
		editBtn.type = 'button';
		editBtn.dataset.editIndex = String(index);
		const removeBtn = createEl('button', 'gm-admin-remove', 'Remover');
		removeBtn.type = 'button';
		removeBtn.dataset.removeIndex = String(index);

		actions.appendChild(editBtn);
		actions.appendChild(removeBtn);
		head.appendChild(title);
		head.appendChild(badge);
		head.appendChild(actions);

		const meta = createEl('p', 'gm-admin-item-meta',
			`${formatPriceLabel(item.price)}` +
			(item.category ? ` · ${item.category}` : '') +
			(item.subcategory ? ` / ${item.subcategory}` : '') +
			(item.brand ? ` · ${item.brand}` : '') +
			(item.qty ? ` · Qtd: ${item.qty}` : '') +
			(item.color ? ` · Cor: ${item.color}` : '') +
			(item.voltage ? ` · ${item.voltage}` : '') +
			` · ${[item.delivery ? 'Entrega' : '', item.pickup ? 'Retirada' : ''].filter(Boolean).join(' + ') || 'Sem modalidade'}` +
			` — ${item.description}`
		);
		card.appendChild(head);
		card.appendChild(meta);
		listEl.appendChild(card);
	});
}

function buildPreviewItem(item) {
	const card = createEl('article', 'gm-preview-item');

	if (item.photo) {
		const photo = createEl('div', 'gm-preview-item-photo');
		photo.style.backgroundImage = `url('${item.photo}')`;
		card.appendChild(photo);
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

	if (item.category || item.subcategory || item.brand) {
		const meta1 = createEl('p', 'gm-preview-item-description',
			[
				item.category,
				item.subcategory ? `Subcategoria: ${item.subcategory}` : '',
				item.brand
			].filter(Boolean).join(' · ')
		);
		body.appendChild(row);
		body.appendChild(price);
		body.appendChild(meta1);
	} else {
		body.appendChild(row);
		body.appendChild(price);
	}

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
	const filtered = gmItems.map(item => {
		const matchedFilters = gmFilters
			.map((filter, index) => ({ filter, index }))
			.filter(({ filter }) => getFilterMatches(item, filter))
			.map(({ filter }) => getFilterName(filter));
		return {
			...item,
			matchedFilters
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

	visible.forEach(item => previewList.appendChild(buildPreviewItem(item)));
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
		scheduleEl.innerHTML = `
			<p class="gm-preview-schedule-line"><strong>Horário:</strong> ${openTime} - ${closeTime}</p>
			<p class="gm-preview-schedule-line"><strong>Dias abertos:</strong> ${daysText}</p>
			${gmClosedDates.length ? `<p class="gm-preview-schedule-line gm-item-tags"><strong>Fechado em:</strong> ${gmClosedDates.map(formatClosedDate).join(', ')}</p>` : ''}
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

function bindTabs() {
	const tabs = document.querySelectorAll('.gm-tab');
	const panels = document.querySelectorAll('.gm-tab-panel');

	tabs.forEach(tab => {
		tab.addEventListener('click', () => {
			const targetId = tab.getAttribute('aria-controls');

			tabs.forEach(t => {
				t.classList.remove('active');
				t.setAttribute('aria-selected', 'false');
			});
			panels.forEach(p => p.classList.add('gm-tab-panel--hidden'));

			tab.classList.add('active');
			tab.setAttribute('aria-selected', 'true');
			const target = document.getElementById(targetId);
			if (target) target.classList.remove('gm-tab-panel--hidden');

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

function bindGerenciamento() {
	const form = document.getElementById('gm-form');
	if (!form) return;

	gmItems = cloneDefaultItems();
	gmFilters = [...GM_DEFAULT.filters];
	gmClosedDates = [...GM_DEFAULT.closedDates];
	renderAdminItems();
	renderFilterList();
	renderClosedDates();
	refreshSubcategoryOptions(GM_DEFAULT.itemCategory, GM_DEFAULT.itemSubcategory);

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
		const button = target.closest('.gm-preview-item-button');
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

	document.getElementById('gm-reset')?.addEventListener('click', resetForm);

	document.getElementById('gm-generate')?.addEventListener('click', () => {
		aplicarPreview();
		gmToast('App criado com sucesso. Previa atualizada.');
	});

	document.getElementById('gm-generate-preview')?.addEventListener('click', () => {
		aplicarPreview();
		gmToast('App criado com sucesso. Previa atualizada.');
	});

	document.getElementById('gm-open-preview-tab')?.addEventListener('click', () => {
		document.getElementById('gm-tab-preview')?.click();
	});

	bindStepAccordion(form);
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
});