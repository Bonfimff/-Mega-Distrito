'use strict';

/* =========================================================
   MEGA DISTRITO — Minha Conta
   Usa a API (JS/api.js) quando o backend está disponível;
   cai para os dados de demonstração (CONTA_PEDIDOS_SEED/
   CONTA_ENDERECOS_SEED) quando não há conexão com o backend.
   ========================================================= */

const STATUS_PEDIDO_LABEL = {
	pagamento: 'Aguardando pagamento',
	preparando: 'Preparando',
	caminho: 'A caminho',
	avaliar: 'A avaliar',
	concluido: 'Concluído',
};

const STATUS_PEDIDO_ICON = {
	pagamento: 'fa-clock',
	preparando: 'fa-box-open',
	caminho: 'fa-truck-fast',
	avaliar: 'fa-star',
	concluido: 'fa-circle-check',
};

// status interno (usado na tela) <-> status do backend (enum do schema)
const STATUS_API_TO_LOCAL = {
	aguardando_pagamento: 'pagamento',
	preparando: 'preparando',
	a_caminho: 'caminho',
	a_avaliar: 'avaliar',
	concluido: 'concluido',
};
const STATUS_LOCAL_TO_API = {
	pagamento: 'aguardando_pagamento',
	preparando: 'preparando',
	caminho: 'a_caminho',
	avaliar: 'a_avaliar',
	concluido: 'concluido',
};

/* Dados de demonstração — cobrem as 5 categorias (pagamento, preparando,
   caminho, avaliar, concluído), com mais de um pedido em algumas, pra dar
   pra testar/revisar o design da lista em cada aba de filtro. Usados só
   quando o backend está fora do ar (ver contaIniciarSessaoLogada). */
const CONTA_PEDIDOS_SEED = [
	{ id: 1, status: 'pagamento', item: 'Fone Bluetooth X200', loja: 'TechMage', valor: '129,90', quando: 'Hoje, 09:40' },
	{ id: 2, status: 'pagamento', item: 'Kit Churrasco 12 peças', loja: 'Bazar Local', valor: '79,90', quando: 'Hoje, 08:15' },
	{ id: 3, status: 'preparando', item: 'Combo da Casa', loja: 'Loja Central', valor: '39,90', quando: 'Ontem' },
	{ id: 4, status: 'preparando', item: 'Camisa Polo Azul (M)', loja: 'Moda Magé', valor: '69,90', quando: 'Ontem' },
	{ id: 5, status: 'caminho', item: 'Notebook Ultrafino i5', loja: 'Mercado Express', valor: '2.799,00', quando: 'Há 1 dia', rastreio: 'BR998877665BR' },
	{ id: 6, status: 'caminho', item: 'Kit Ferramentas', loja: 'Bazar Local', valor: '89,00', quando: 'Há 2 dias', rastreio: 'BR123456789BR' },
	{ id: 7, status: 'avaliar', item: 'Instalação Residencial', loja: 'Serviços Pro', valor: '120,00', quando: 'Há 5 dias' },
	{ id: 8, status: 'avaliar', item: 'Mesa de Centro Rústica', loja: 'Loja Central', valor: '349,00', quando: 'Há 6 dias' },
	{ id: 9, status: 'concluido', item: 'Cadeira Gamer Preta', loja: 'TechMage', valor: '899,00', quando: 'Há 12 dias' },
	{ id: 10, status: 'concluido', item: 'Reparo Elétrico', loja: 'Serviços Pro', valor: '150,00', quando: 'Há 20 dias' },
];

const CONTA_ENDERECOS_SEED = [
	{ id: 1, apelido: 'Casa', rua: 'Rua Principal, 123', bairro: 'Centro', cidade: 'Magé - RJ', cep: '25900-000' },
];

let contaUsuario = null;
let contaUsandoApi = false;
let contaPedidos = [];
let contaEnderecos = [];
let contaPedidosFiltro = 'pagamento';
let contaAvaliacaoAbertaId = -1;
let contaAvaliacaoNota = 0;
let authModoCadastro = false;

function contaToast(msg) {
	toast(msg);
}

// createEl(tag, className, text) agora vem de utils.js (carregado antes deste arquivo).

function formatPrecoConta(valor) {
	const numero = typeof valor === 'number' ? valor : parseFloat(String(valor).replace('.', '').replace(',', '.'));
	if (Number.isNaN(numero)) return `R$ ${valor}`;
	return `R$ ${numero.toFixed(2).replace('.', ',')}`;
}

function formatQuandoConta(dataIso) {
	if (!dataIso) return '';
	const data = new Date(dataIso.replace(' ', 'T'));
	if (Number.isNaN(data.getTime())) return '';
	return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function pedidoApiParaLocal(p) {
	return {
		id: p.id,
		status: STATUS_API_TO_LOCAL[p.status] || 'pagamento',
		item: p.item_nome || `Pedido #${p.id}`,
		loja: p.loja_nome || 'Vitrine Mega Distrito',
		valor: formatPrecoConta(p.valor).replace('R$ ', ''),
		quando: formatQuandoConta(p.criado_em),
		rastreio: p.codigo_rastreio || null,
	};
}

/* ── Autenticação ── */

function contaAtualizarModoAuth() {
	document.getElementById('auth-titulo').textContent = authModoCadastro ? 'Criar conta' : 'Entrar';
	document.getElementById('auth-subtitulo').textContent = authModoCadastro
		? 'Preencha seus dados para criar sua conta.'
		: 'Entre com sua conta para ver pedidos e endereços.';
	document.getElementById('auth-campo-nome').hidden = !authModoCadastro;
	document.getElementById('auth-enviar').textContent = authModoCadastro ? 'Criar conta' : 'Entrar';
	document.getElementById('auth-alternar').textContent = authModoCadastro
		? 'Já tenho conta'
		: 'Ainda não tenho conta';
}

async function contaEnviarAuth() {
	const email = document.getElementById('auth-email')?.value?.trim();
	const senha = document.getElementById('auth-senha')?.value;

	if (!email || !senha) {
		contaToast('Preencha e-mail e senha.');
		return;
	}

	if (authModoCadastro) {
		const nome = document.getElementById('auth-nome')?.value?.trim();
		if (!nome) {
			contaToast('Informe seu nome completo.');
			return;
		}
		const resultado = await cadastrarUsuario({ nome, email, senha });
		if (!resultado || resultado.erro) {
			contaToast(resultado?.erro || 'Não foi possível criar a conta. O backend está no ar?');
			return;
		}
		if (resultado.aguardando_confirmacao) {
			abrirConfirmarCadastro(resultado.email);
			contaToast('Conta criada! Confirme o código enviado para seu e-mail.');
			return;
		}
		contaSalvarSessao(resultado);
		contaToast('Conta criada com sucesso!');
	} else {
		const resultado = await loginUsuario({ email, senha });
		if (!resultado || resultado.erro) {
			if (resultado?.email_nao_confirmado) {
				abrirConfirmarCadastro(resultado.email);
				contaToast('Confirme seu e-mail para poder entrar.');
				return;
			}
			contaToast(resultado?.erro || 'Não foi possível entrar. Verifique e-mail/senha ou se o backend está no ar.');
			return;
		}
		contaSalvarSessao(resultado);
		contaToast(`Bem-vindo(a), ${resultado.nome.split(' ')[0]}!`);
	}

	await contaIniciarSessaoLogada();
}

/* ── Confirmação de cadastro ── */

let confirmarEmailPendente = '';

function abrirConfirmarCadastro(email) {
	confirmarEmailPendente = email;
	document.getElementById('auth-form').hidden = true;
	document.getElementById('recuperar-form').hidden = true;
	document.getElementById('confirmar-form').hidden = false;
}

function fecharConfirmarCadastro() {
	confirmarEmailPendente = '';
	document.getElementById('confirmar-form').reset();
	document.getElementById('confirmar-form').hidden = true;
	document.getElementById('auth-form').hidden = false;
}

async function contaEnviarConfirmacao() {
	const codigo = document.getElementById('confirmar-codigo')?.value?.trim();
	if (!codigo) {
		contaToast('Informe o código recebido por e-mail.');
		return;
	}

	const resultado = await confirmarCadastro(confirmarEmailPendente, codigo);
	if (!resultado || resultado.erro) {
		contaToast(resultado?.erro || 'Não foi possível confirmar o cadastro.');
		return;
	}

	contaSalvarSessao(resultado);
	contaToast(`Conta confirmada! Bem-vindo(a), ${resultado.nome.split(' ')[0]}!`);
	fecharConfirmarCadastro();
	await contaIniciarSessaoLogada();
}

async function contaReenviarCodigoCadastro() {
	if (!confirmarEmailPendente) return;
	const resultado = await reenviarCodigoCadastro(confirmarEmailPendente);
	if (!resultado) {
		contaToast('Não foi possível reenviar o código. O backend está no ar?');
		return;
	}
	contaToast('Código reenviado! Verifique sua caixa de entrada.');
}

/* ── Recuperação de senha ── */

let recuperarCodigoEnviado = false;

function abrirRecuperarSenha() {
	document.getElementById('auth-form').hidden = true;
	document.getElementById('recuperar-form').hidden = false;
}

function fecharRecuperarSenha() {
	recuperarCodigoEnviado = false;
	document.getElementById('recuperar-form').reset();
	document.getElementById('recuperar-campo-codigo').hidden = true;
	document.getElementById('recuperar-campo-nova-senha').hidden = true;
	document.getElementById('recuperar-instrucao').textContent = 'Informe seu e-mail para receber um código de recuperação.';
	document.getElementById('recuperar-enviar').textContent = 'Enviar código';
	document.getElementById('recuperar-form').hidden = true;
	document.getElementById('auth-form').hidden = false;
}

async function contaEnviarRecuperacao() {
	const email = document.getElementById('recuperar-email')?.value?.trim();
	if (!email) {
		contaToast('Informe seu e-mail.');
		return;
	}

	if (!recuperarCodigoEnviado) {
		const resultado = await solicitarRecuperacaoSenha(email);
		if (!resultado) {
			contaToast('Não foi possível enviar o código. O backend está no ar?');
			return;
		}
		recuperarCodigoEnviado = true;
		document.getElementById('recuperar-campo-codigo').hidden = false;
		document.getElementById('recuperar-campo-nova-senha').hidden = false;
		document.getElementById('recuperar-instrucao').textContent = 'Enviamos um código para seu e-mail. Informe-o abaixo com sua nova senha.';
		document.getElementById('recuperar-enviar').textContent = 'Redefinir senha';
		contaToast('Código enviado! Verifique sua caixa de entrada.');
		return;
	}

	const codigo = document.getElementById('recuperar-codigo')?.value?.trim();
	const novaSenha = document.getElementById('recuperar-nova-senha')?.value;
	if (!codigo || !novaSenha) {
		contaToast('Informe o código recebido e a nova senha.');
		return;
	}

	const resultado = await redefinirSenha(email, codigo, novaSenha);
	if (!resultado || resultado.erro) {
		contaToast(resultado?.erro || 'Não foi possível redefinir a senha.');
		return;
	}

	contaToast('Senha redefinida com sucesso! Entre com sua nova senha.');
	fecharRecuperarSenha();
}

function contaSair() {
	contaEncerrarSessao();
	contaUsuario = null;
	contaUsandoApi = false;
	document.getElementById('painel-auth').classList.remove('conta-panel--hidden');
	document.getElementById('conta-tabs-row').hidden = true;
	document.getElementById('conta-header-card').hidden = true;
	document.getElementById('conta-stats').hidden = true;
	['painel-encomendas', 'painel-dados', 'painel-enderecos', 'painel-anuncios'].forEach(id => {
		document.getElementById(id)?.classList.add('conta-panel--hidden');
	});
	contaAnunciosBazar = [];
	contaAnunciosServicos = [];
	contaToast('Você saiu da sua conta.');
}

/* ── Encomendas ── */

function buildEstrelasAvaliacao(pedidoId) {
	const wrap = createEl('div', 'avaliacao-estrelas');
	for (let i = 1; i <= 5; i += 1) {
		const estrela = createEl('button', `avaliacao-estrela${i <= contaAvaliacaoNota ? ' is-ativa' : ''}`);
		estrela.type = 'button';
		estrela.dataset.action = 'definir-nota';
		estrela.dataset.pedidoId = String(pedidoId);
		estrela.dataset.nota = String(i);
		const icon = document.createElement('i');
		icon.className = i <= contaAvaliacaoNota ? 'fas fa-star' : 'far fa-star';
		estrela.appendChild(icon);
		wrap.appendChild(estrela);
	}
	return wrap;
}

function buildAvaliacaoForm(pedido) {
	const form = createEl('div', 'avaliacao-form');
	form.appendChild(createEl('span', 'avaliacao-form-label', 'Sua nota'));
	form.appendChild(buildEstrelasAvaliacao(pedido.id));

	const textarea = document.createElement('textarea');
	textarea.rows = 2;
	textarea.placeholder = 'Conte como foi sua experiência (opcional)...';
	textarea.id = 'avaliacao-comentario';
	form.appendChild(textarea);

	const actions = createEl('div', 'avaliacao-form-actions');
	const cancelar = createEl('button', 'btn btn-outline', 'Cancelar');
	cancelar.type = 'button';
	cancelar.dataset.action = 'cancelar-avaliacao';
	const enviar = createEl('button', 'btn btn-primary', 'Enviar avaliação');
	enviar.type = 'button';
	enviar.dataset.action = 'enviar-avaliacao';
	enviar.dataset.pedidoId = String(pedido.id);
	actions.appendChild(cancelar);
	actions.appendChild(enviar);
	form.appendChild(actions);

	return form;
}

function buildPedidoActions(pedido) {
	const actions = createEl('div', 'pedido-actions');

	if (pedido.status === 'pagamento') {
		const btn = createEl('button', 'btn btn-primary', 'Pagar agora');
		btn.type = 'button';
		btn.dataset.action = 'pagar';
		btn.dataset.pedidoId = String(pedido.id);
		actions.appendChild(btn);
		return actions;
	}

	if (pedido.status === 'preparando') {
		actions.appendChild(createEl('span', 'pedido-tag', 'A loja está preparando seu pedido'));
		return actions;
	}

	if (pedido.status === 'caminho') {
		const btn = createEl('button', 'btn btn-outline', 'Rastrear pedido');
		btn.type = 'button';
		btn.dataset.action = 'rastrear';
		btn.dataset.pedidoId = String(pedido.id);
		actions.appendChild(btn);
		return actions;
	}

	if (pedido.status === 'avaliar') {
		if (contaAvaliacaoAbertaId === pedido.id) {
			actions.appendChild(buildAvaliacaoForm(pedido));
		} else {
			const btn = createEl('button', 'btn btn-primary', 'Avaliar pedido');
			btn.type = 'button';
			btn.dataset.action = 'abrir-avaliacao';
			btn.dataset.pedidoId = String(pedido.id);
			actions.appendChild(btn);
		}
		return actions;
	}

	if (pedido.status === 'concluido') {
		actions.appendChild(createEl('span', 'pedido-tag pedido-tag--concluido', 'Pedido entregue e avaliado'));
		const comprarBtn = createEl('button', 'btn btn-outline', 'Comprar novamente');
		comprarBtn.type = 'button';
		comprarBtn.dataset.action = 'comprar-novamente';
		comprarBtn.dataset.pedidoId = String(pedido.id);
		actions.appendChild(comprarBtn);
		return actions;
	}

	return actions;
}

function buildPedidoCard(pedido) {
	const card = createEl('article', `pedido-card pedido-card--${pedido.status}`);

	const head = createEl('div', 'pedido-card-head');
	const icon = createEl('span', 'pedido-icon');
	icon.innerHTML = `<i class="fas ${STATUS_PEDIDO_ICON[pedido.status] || 'fa-box'}"></i>`;
	head.appendChild(icon);

	const info = createEl('div', 'pedido-info');
	info.appendChild(createEl('h5', 'pedido-item-nome', pedido.item));
	info.appendChild(createEl('span', 'pedido-loja', pedido.loja));
	head.appendChild(info);

	head.appendChild(createEl('span', `pedido-status-badge pedido-status-badge--${pedido.status}`, STATUS_PEDIDO_LABEL[pedido.status]));
	card.appendChild(head);

	card.appendChild(createEl('p', 'pedido-meta', `${formatPrecoConta(pedido.valor)} · ${pedido.quando}`));

	if (pedido.status === 'caminho' && pedido.rastreio) {
		card.appendChild(createEl('p', 'pedido-rastreio', `Código de rastreio: ${pedido.rastreio}`));
	}

	card.appendChild(buildPedidoActions(pedido));

	return card;
}

/** Substitui contaPedidos/contaEnderecos pelos dados de exemplo, na hora,
 *  sem precisar recarregar a página com ?demo=1 — usado pelo botão que
 *  aparece na lista vazia (ver renderPedidos). */
function contaCarregarPedidosDemo() {
	contaPedidos = CONTA_PEDIDOS_SEED.map(p => ({ ...p }));
	if (!contaEnderecos.length) contaEnderecos = CONTA_ENDERECOS_SEED.map(e => ({ ...e }));
	contaAtualizarHeader();
	renderPedidos();
	renderEnderecos();
	contaToast('Pedidos de exemplo carregados (só nesta sessão do navegador).');
}

function renderPedidos() {
	const list = document.getElementById('pedidos-list');
	if (!list) return;

	list.innerHTML = '';
	const filtrados = contaPedidos.filter(p => p.status === contaPedidosFiltro);

	if (!filtrados.length) {
		list.appendChild(createEl('div', 'conta-empty', 'Nenhum pedido nesta categoria.'));

		// Conta sem NENHUM pedido (não só nesta categoria) → oferece
		// carregar dados de exemplo pra dar pra testar o design das 5
		// categorias sem depender de pedidos reais no backend.
		if (!contaPedidos.length) {
			const btn = createEl('button', 'conta-link-btn', 'Carregar pedidos de exemplo (teste de design)');
			btn.type = 'button';
			btn.addEventListener('click', contaCarregarPedidosDemo);
			list.appendChild(btn);
		}
		return;
	}

	filtrados.forEach(pedido => list.appendChild(buildPedidoCard(pedido)));

	if (contaAvaliacaoAbertaId >= 0) {
		list.querySelector('.avaliacao-form textarea')?.focus();
	}
}

/** Placeholders "pulsando" mostrados enquanto os pedidos/endereços reais
 *  ainda não chegaram da API — evita a lista aparecer vazia/em branco
 *  por alguns segundos e só "pipocar" quando a resposta chega. */
function renderSkeleton(containerId, quantidade, className) {
	const list = document.getElementById(containerId);
	if (!list) return;
	list.innerHTML = '';
	for (let i = 0; i < quantidade; i += 1) {
		list.appendChild(createEl('div', `conta-skeleton ${className}`));
	}
}

function filtrarPedidos(status) {
	contaPedidosFiltro = status;
	document.querySelectorAll('.pedido-filtro-chip').forEach(chip => {
		chip.classList.toggle('active', chip.dataset.status === status);
	});
	renderPedidos();
}

async function pagarPedido(id) {
	const pedido = contaPedidos.find(p => p.id === id);
	if (!pedido) return;
	pedido.status = 'preparando';
	renderPedidos();
	if (contaUsandoApi) await atualizarStatusPedido(id, STATUS_LOCAL_TO_API.preparando);
	contaToast('Pagamento confirmado! A loja já foi notificada e vai preparar seu pedido.');
}

function rastrearPedido(id) {
	const pedido = contaPedidos.find(p => p.id === id);
	if (!pedido) return;
	contaToast(`Rastreio ${pedido.rastreio || 'indisponível'}: seu pedido está a caminho.`);
}

function contaComprarNovamente(id) {
	const pedido = contaPedidos.find(p => p.id === id);
	if (!pedido) return;
	// Pedido guarda só um retrato do item na hora da compra (nome/preço/
	// loja), não o produto completo do catálogo — por isso ainda não dá
	// pra jogar direto no carrinho da vitrine sem arriscar um item quebrado
	// (sem categoria/emoji). Por enquanto só confirma a intenção.
	contaToast(`Vamos te ajudar a encontrar "${pedido.item}" de novo na loja ${pedido.loja}.`);
}

function abrirAvaliacao(id) {
	contaAvaliacaoAbertaId = id;
	contaAvaliacaoNota = 0;
	renderPedidos();
}

function cancelarAvaliacao() {
	contaAvaliacaoAbertaId = -1;
	contaAvaliacaoNota = 0;
	renderPedidos();
}

function definirNotaAvaliacao(nota) {
	contaAvaliacaoNota = nota;
	renderPedidos();
}

async function enviarAvaliacao(id) {
	if (!contaAvaliacaoNota) {
		contaToast('Selecione uma nota de 1 a 5 estrelas.');
		return;
	}
	const pedido = contaPedidos.find(p => p.id === id);
	if (!pedido) return;
	pedido.status = 'concluido';
	const comentario = document.getElementById('avaliacao-comentario')?.value || '';
	const notaEnviada = contaAvaliacaoNota;
	if (contaUsandoApi) {
		await criarAvaliacao(id, { usuario_id: contaUsuario.id, nota: notaEnviada, comentario });
	}
	contaAvaliacaoAbertaId = -1;
	contaAvaliacaoNota = 0;
	renderPedidos();
	contaToast('Avaliação enviada! Obrigado pelo feedback.');
}

/* ── Meus Dados ── */

function salvarDadosConta() {
	const nome = document.getElementById('conta-nome')?.value?.trim();
	if (!nome) {
		contaToast('Informe seu nome completo.');
		return;
	}
	const senha = document.getElementById('conta-senha');
	if (senha) senha.value = '';
	contaToast('Dados atualizados (demonstração — edição via API ainda não implementada).');
}

/* ── Endereços ── */

function buildEnderecoCard(endereco) {
	const card = createEl('article', 'endereco-card');
	const head = createEl('div', 'endereco-card-head');
	head.appendChild(createEl('span', 'endereco-tag', endereco.apelido));
	const removeBtn = createEl('button', 'endereco-remove-btn', 'Remover');
	removeBtn.type = 'button';
	removeBtn.dataset.action = 'remover-endereco';
	removeBtn.dataset.enderecoId = String(endereco.id);
	head.appendChild(removeBtn);
	card.appendChild(head);

	card.appendChild(createEl('p', 'endereco-linha', endereco.rua));
	card.appendChild(createEl('p', 'endereco-linha', `${endereco.bairro} · ${endereco.cidade}`));
	card.appendChild(createEl('p', 'endereco-linha endereco-cep', `CEP: ${endereco.cep}`));

	return card;
}

function renderEnderecos() {
	const list = document.getElementById('enderecos-list');
	if (!list) return;
	list.innerHTML = '';
	if (!contaEnderecos.length) {
		list.appendChild(createEl('div', 'conta-empty', 'Nenhum endereço cadastrado ainda.'));
		return;
	}
	contaEnderecos.forEach(endereco => list.appendChild(buildEnderecoCard(endereco)));
}

function abrirFormEndereco() {
	document.getElementById('endereco-form')?.removeAttribute('hidden');
	document.getElementById('endereco-abrir-form')?.setAttribute('hidden', '');
}

function fecharFormEndereco() {
	const form = document.getElementById('endereco-form');
	if (form) {
		form.setAttribute('hidden', '');
		form.reset();
	}
	document.getElementById('endereco-abrir-form')?.removeAttribute('hidden');
}

async function salvarEndereco() {
	const apelido = document.getElementById('endereco-apelido')?.value || 'Casa';
	const rua = document.getElementById('endereco-rua')?.value?.trim();
	const bairro = document.getElementById('endereco-bairro')?.value?.trim();
	const cidade = document.getElementById('endereco-cidade')?.value?.trim();
	const cep = document.getElementById('endereco-cep')?.value?.trim();

	if (!rua || !bairro || !cidade || !cep) {
		contaToast('Preencha todos os campos do endereço.');
		return;
	}

	if (contaUsandoApi) {
		const resultado = await criarEndereco(contaUsuario.id, { apelido, rua, bairro, cidade, cep });
		if (!resultado) {
			contaToast('Não foi possível salvar no servidor. Tente novamente.');
			return;
		}
		contaEnderecos.push({ id: resultado.id, apelido, rua, bairro, cidade, cep });
	} else {
		const novoId = contaEnderecos.reduce((max, e) => Math.max(max, e.id), 0) + 1;
		contaEnderecos.push({ id: novoId, apelido, rua, bairro, cidade, cep });
	}

	renderEnderecos();
	fecharFormEndereco();
	contaToast('Endereço cadastrado.');
}

async function removerEndereco(id) {
	contaEnderecos = contaEnderecos.filter(e => e.id !== id);
	renderEnderecos();
	if (contaUsandoApi) await removerEnderecoApi(id);
	contaToast('Endereço removido.');
}

/* ── Meus Anúncios (Bazar + Serviços/Agenda) ──
   Ainda não existe endpoint no backend pra um usuário comum publicar no
   Bazar ou oferecer serviço sem ser dono de uma loja (ver JS/api.js — só
   /itens ligado a uma loja). Guardamos por enquanto no localStorage,
   isolado por usuário, e já deixamos pronta a integração com as vitrines
   públicas (ver mesclarAnunciosLocaisNoBazar em script.js e
   mesclarAnunciosLocaisNosServicos em servicos.js). */

function contaChaveAnunciosBazar() {
	return `mage-bazar-usuario-${contaUsuario?.id ?? 'anonimo'}`;
}
function contaChaveAnunciosServicos() {
	return `mage-servicos-usuario-${contaUsuario?.id ?? 'anonimo'}`;
}

function contaCarregarAnunciosBazar() {
	try { return JSON.parse(localStorage.getItem(contaChaveAnunciosBazar())) || []; }
	catch { return []; }
}
function contaSalvarAnunciosBazar(lista) {
	try { localStorage.setItem(contaChaveAnunciosBazar(), JSON.stringify(lista)); }
	catch { /* sem suporte a localStorage — ignora */ }
}
function contaCarregarAnunciosServicos() {
	try { return JSON.parse(localStorage.getItem(contaChaveAnunciosServicos())) || []; }
	catch { return []; }
}
function contaSalvarAnunciosServicos(lista) {
	try { localStorage.setItem(contaChaveAnunciosServicos(), JSON.stringify(lista)); }
	catch { /* sem suporte a localStorage — ignora */ }
}

let contaAnunciosBazar = [];
let contaAnunciosServicos = [];

const CONTA_BAZAR_CATEGORIA_LABEL = {
	eletronicos: 'Eletrônicos', casa: 'Casa e Cozinha', ferramentas: 'Ferramentas', moda: 'Moda', outros: 'Outros',
};
const CONTA_BAZAR_CONDICAO_LABEL = { otimo: 'Ótimo estado', bom: 'Bom estado', regular: 'Estado regular' };

function buildAnuncioBazarCard(item) {
	const card = createEl('article', 'anuncio-card');
	const head = createEl('div', 'anuncio-card-head');
	head.appendChild(createEl('span', 'anuncio-tag', CONTA_BAZAR_CATEGORIA_LABEL[item.categoria] || 'Outros'));
	head.appendChild(createEl('span', 'anuncio-tag anuncio-tag--condicao', CONTA_BAZAR_CONDICAO_LABEL[item.condicao] || ''));
	card.appendChild(head);

	card.appendChild(createEl('h5', 'anuncio-nome', item.nome));
	if (item.desc) card.appendChild(createEl('p', 'anuncio-desc', item.desc));

	const precos = createEl('p', 'anuncio-preco', brl(item.preco));
	if (item.precoOrig && item.precoOrig > item.preco) {
		const orig = createEl('span', 'anuncio-preco-orig', ` de ${brl(item.precoOrig)}`);
		precos.appendChild(orig);
	}
	card.appendChild(precos);

	const actions = createEl('div', 'anuncio-actions');
	const removeBtn = createEl('button', 'endereco-remove-btn', 'Remover anúncio');
	removeBtn.type = 'button';
	removeBtn.dataset.action = 'remover-anuncio-bazar';
	removeBtn.dataset.anuncioId = String(item.id);
	actions.appendChild(removeBtn);
	card.appendChild(actions);

	return card;
}

function renderAnunciosBazar() {
	const list = document.getElementById('anuncios-bazar-list');
	if (!list) return;
	list.innerHTML = '';
	if (!contaAnunciosBazar.length) {
		list.appendChild(createEl('div', 'conta-empty', 'Você ainda não anunciou nenhum produto no Bazar.'));
		return;
	}
	contaAnunciosBazar.forEach(item => list.appendChild(buildAnuncioBazarCard(item)));
}

function abrirFormAnuncioBazar() {
	document.getElementById('anuncio-bazar-form')?.removeAttribute('hidden');
	document.getElementById('anuncio-bazar-abrir-form')?.setAttribute('hidden', '');
}
function fecharFormAnuncioBazar() {
	const form = document.getElementById('anuncio-bazar-form');
	if (form) { form.setAttribute('hidden', ''); form.reset(); }
	document.getElementById('anuncio-bazar-abrir-form')?.removeAttribute('hidden');
}

function salvarAnuncioBazar() {
	const nome = document.getElementById('anuncio-bazar-nome')?.value?.trim();
	const desc = document.getElementById('anuncio-bazar-desc')?.value?.trim() || '';
	const categoria = document.getElementById('anuncio-bazar-categoria')?.value || 'outros';
	const condicao = document.getElementById('anuncio-bazar-condicao')?.value || 'bom';
	const preco = parseFloat(document.getElementById('anuncio-bazar-preco')?.value);
	const precoOrigCampo = document.getElementById('anuncio-bazar-preco-orig')?.value;
	const precoOrig = precoOrigCampo ? parseFloat(precoOrigCampo) : null;

	if (!nome || Number.isNaN(preco) || preco <= 0) {
		contaToast('Informe pelo menos o nome e um preço válido.');
		return;
	}

	const novoId = `local-${Date.now()}`;
	contaAnunciosBazar.push({
		id: novoId, nome, desc, categoria, condicao,
		condicaoLabel: CONTA_BAZAR_CONDICAO_LABEL[condicao],
		preco, precoOrig: precoOrig && precoOrig > preco ? precoOrig : null,
		emoji: '📦',
		vendedor: contaUsuario?.nome || 'Você',
		bairro: 'Magé',
		local: true,
	});
	contaSalvarAnunciosBazar(contaAnunciosBazar);
	renderAnunciosBazar();
	fecharFormAnuncioBazar();
	contaToast('Produto publicado no Bazar!');
}

function removerAnuncioBazar(id) {
	contaAnunciosBazar = contaAnunciosBazar.filter(i => i.id !== id);
	contaSalvarAnunciosBazar(contaAnunciosBazar);
	renderAnunciosBazar();
	contaToast('Anúncio removido do Bazar.');
}

function buildAnuncioServicoCard(servico) {
	const card = createEl('article', 'anuncio-card');
	card.appendChild(createEl('h5', 'anuncio-nome', servico.ocupacao));
	if (servico.desc) card.appendChild(createEl('p', 'anuncio-desc', servico.desc));
	card.appendChild(createEl('p', 'anuncio-preco', `${brl(servico.preco)} por ${servico.unidade}`));

	const agendaTxt = servico.agenda?.dias?.length
		? `${servico.agenda.dias.join(', ')} · ${servico.agenda.inicio} às ${servico.agenda.fim}`
		: 'Sem dias definidos ainda';
	card.appendChild(createEl('p', 'anuncio-agenda', agendaTxt));

	const actions = createEl('div', 'anuncio-actions');
	const removeBtn = createEl('button', 'endereco-remove-btn', 'Remover serviço');
	removeBtn.type = 'button';
	removeBtn.dataset.action = 'remover-anuncio-servico';
	removeBtn.dataset.anuncioId = String(servico.id);
	actions.appendChild(removeBtn);
	card.appendChild(actions);

	return card;
}

function renderAnunciosServicos() {
	const list = document.getElementById('anuncios-servicos-list');
	if (!list) return;
	list.innerHTML = '';
	if (!contaAnunciosServicos.length) {
		list.appendChild(createEl('div', 'conta-empty', 'Você ainda não oferece nenhum serviço.'));
		return;
	}
	contaAnunciosServicos.forEach(s => list.appendChild(buildAnuncioServicoCard(s)));
}

function abrirFormAnuncioServico() {
	document.getElementById('anuncio-servico-form')?.removeAttribute('hidden');
	document.getElementById('anuncio-servico-abrir-form')?.setAttribute('hidden', '');
}
function fecharFormAnuncioServico() {
	const form = document.getElementById('anuncio-servico-form');
	if (form) {
		form.setAttribute('hidden', '');
		form.reset();
		form.querySelectorAll('.agenda-dia-toggle input').forEach(cb => { cb.checked = false; });
	}
	document.getElementById('anuncio-servico-abrir-form')?.removeAttribute('hidden');
}

function salvarAnuncioServico() {
	const ocupacao = document.getElementById('anuncio-servico-ocupacao')?.value?.trim();
	const desc = document.getElementById('anuncio-servico-desc')?.value?.trim() || '';
	const bairro = document.getElementById('anuncio-servico-bairro')?.value?.trim() || 'Magé';
	const preco = parseFloat(document.getElementById('anuncio-servico-preco')?.value);
	const unidade = document.getElementById('anuncio-servico-unidade')?.value || 'servico';
	const inicio = document.getElementById('anuncio-servico-horario-inicio')?.value || '08:00';
	const fim = document.getElementById('anuncio-servico-horario-fim')?.value || '18:00';
	const dias = Array.from(document.querySelectorAll('#anuncio-servico-agenda-dias input:checked')).map(cb => cb.value);

	if (!ocupacao || Number.isNaN(preco) || preco <= 0) {
		contaToast('Informe pelo menos o serviço oferecido e um preço válido.');
		return;
	}
	if (!dias.length) {
		contaToast('Selecione ao menos um dia disponível na agenda.');
		return;
	}

	const novoId = `local-${Date.now()}`;
	contaAnunciosServicos.push({
		id: novoId, nome: contaUsuario?.nome || 'Você', ocupacao, desc, bairro,
		preco, unidade, telefone: contaUsuario?.telefone || '',
		avaliacao: 0, avaliacoes: 0, verificado: false, disponivel: true, tags: [],
		agenda: { dias, inicio, fim },
		local: true,
	});
	contaSalvarAnunciosServicos(contaAnunciosServicos);
	renderAnunciosServicos();
	fecharFormAnuncioServico();
	contaToast('Serviço publicado com sua agenda de disponibilidade!');
}

function removerAnuncioServico(id) {
	contaAnunciosServicos = contaAnunciosServicos.filter(s => s.id !== id);
	contaSalvarAnunciosServicos(contaAnunciosServicos);
	renderAnunciosServicos();
	contaToast('Serviço removido.');
}

/* ── Abas ── */

function bindContaTabs() {
	const tabs = document.querySelectorAll('.conta-tab');
	const panels = document.querySelectorAll('.conta-panel');

	tabs.forEach(tab => {
		tab.addEventListener('click', () => {
			const targetId = tab.getAttribute('aria-controls');

			tabs.forEach(t => {
				t.classList.remove('active');
				t.setAttribute('aria-selected', 'false');
			});
			panels.forEach(p => {
				if (p.id !== 'painel-auth') p.classList.add('conta-panel--hidden');
			});

			tab.classList.add('active');
			tab.setAttribute('aria-selected', 'true');
			document.getElementById(targetId)?.classList.remove('conta-panel--hidden');
		});
	});
}

/* ── Sessão logada: carrega dados reais (ou seed) ── */

/** Quantos dos "critérios de perfil completo" o usuário já preencheu.
 *  E-mail é sempre considerado ok pra quem está logado — o login só
 *  funciona depois da confirmação por e-mail (ver contaEnviarAuth). */
function contaCalcularProgressoPerfil() {
	const criterios = [
		true, // nome — obrigatório no cadastro
		true, // e-mail confirmado — pré-condição de login
		!!(contaUsuario?.telefone && String(contaUsuario.telefone).trim()),
		contaEnderecos.length > 0,
	];
	const completos = criterios.filter(Boolean).length;
	return Math.round((completos / criterios.length) * 100);
}

function contaAtualizarHeader() {
	if (!contaUsuario) return;

	const primeiroNome = (contaUsuario.nome || '').trim().split(' ')[0] || '';
	document.getElementById('conta-header-titulo').textContent = `Conta de ${contaUsuario.nome || primeiroNome}`;
	document.getElementById('conta-header-nome').textContent = contaUsuario.nome || '—';
	document.getElementById('conta-header-email').textContent = contaUsuario.email || '—';
	const avatar = document.getElementById('conta-header-avatar');
	if (avatar) avatar.textContent = (contaUsuario.nome || '?').trim().charAt(0).toUpperCase();
	document.getElementById('conta-header-card').hidden = false;

	document.getElementById('conta-progresso-dados').textContent = `${contaCalcularProgressoPerfil()}%`;

	const emAndamento = contaPedidos.filter(p => p.status !== 'concluido').length;
	document.getElementById('conta-stat-ativos').textContent = String(emAndamento);
	document.getElementById('conta-stat-ultimo').textContent = contaPedidos[0]?.quando || '—';
	document.getElementById('conta-stat-enderecos').textContent = String(contaEnderecos.length);
	document.getElementById('conta-stats').hidden = false;

	document.getElementById('conta-resumo-nome').textContent = `Nome: ${contaUsuario.nome || '—'}`;
	document.getElementById('conta-resumo-email').textContent = `E-mail: ${contaUsuario.email || '—'}`;
	document.getElementById('conta-resumo-telefone').textContent = `Telefone: ${contaUsuario.telefone || 'não informado'}`;

	const enderecoPadrao = contaEnderecos[0];
	document.getElementById('conta-resumo-endereco').textContent = enderecoPadrao
		? `${enderecoPadrao.apelido} — ${enderecoPadrao.rua}, ${enderecoPadrao.bairro}`
		: 'Nenhum endereço cadastrado ainda.';
}

async function contaIniciarSessaoLogada() {
	contaUsuario = contaObterSessao();
	if (!contaUsuario) return;

	document.getElementById('painel-auth').classList.add('conta-panel--hidden');
	document.getElementById('conta-tabs-row').hidden = false;
	document.getElementById('painel-encomendas').classList.remove('conta-panel--hidden');

	const nomeInput = document.getElementById('conta-nome');
	const emailInput = document.getElementById('conta-email');
	const telefoneInput = document.getElementById('conta-telefone');
	if (nomeInput) nomeInput.value = contaUsuario.nome;
	if (emailInput) emailInput.value = contaUsuario.email;
	if (telefoneInput) telefoneInput.value = contaUsuario.telefone || '';

	// Nome/e-mail já são conhecidos sem esperar API nenhuma — mostra o
	// cartão de cabeçalho na hora (só os números de pedidos/endereços é
	// que ficam faltando até a resposta chegar, preenchidos mais abaixo).
	document.getElementById('conta-header-titulo').textContent = `Conta de ${contaUsuario.nome || ''}`;
	document.getElementById('conta-header-nome').textContent = contaUsuario.nome || '—';
	document.getElementById('conta-header-email').textContent = contaUsuario.email || '—';
	const avatarPrecoce = document.getElementById('conta-header-avatar');
	if (avatarPrecoce) avatarPrecoce.textContent = (contaUsuario.nome || '?').trim().charAt(0).toUpperCase();
	document.getElementById('conta-header-card').hidden = false;

	// Mostra placeholders enquanto pedidos/endereços carregam da API,
	// em vez de deixar a lista em branco até a resposta chegar.
	renderSkeleton('pedidos-list', 3, 'conta-skeleton-pedido');
	renderSkeleton('enderecos-list', 1, 'conta-skeleton-endereco');

	// Modo demonstração pra revisar o design das 5 categorias de pedido
	// sem depender da conta ter pedidos reais no backend: abra a página
	// com ?demo=1 no final da URL (ex: conta.html?demo=1).
	const modoDemo = new URLSearchParams(location.search).get('demo') === '1';

	// Em paralelo (não uma espera atrás da outra) para reduzir o tempo
	// total até sair do estado de carregamento.
	const [pedidosApi, enderecosApi] = modoDemo
		? [null, null]
		: await Promise.all([
			fetchPedidosUsuario(contaUsuario.id),
			fetchEnderecos(contaUsuario.id),
		]);

	if (pedidosApi) {
		contaUsandoApi = true;
		contaPedidos = pedidosApi.map(pedidoApiParaLocal);
		contaEnderecos = enderecosApi || [];
	} else {
		contaUsandoApi = false;
		contaPedidos = CONTA_PEDIDOS_SEED.map(p => ({ ...p }));
		contaEnderecos = CONTA_ENDERECOS_SEED.map(e => ({ ...e }));
		contaToast(modoDemo
			? 'Modo demonstração: mostrando pedidos de exemplo.'
			: 'Backend indisponível — mostrando dados de demonstração.');
	}

	contaAtualizarHeader();
	renderPedidos();
	renderEnderecos();

	contaAnunciosBazar = contaCarregarAnunciosBazar();
	contaAnunciosServicos = contaCarregarAnunciosServicos();
	renderAnunciosBazar();
	renderAnunciosServicos();
}

function bindConta() {
	bindContaTabs();
	contaAtualizarModoAuth();

	document.getElementById('auth-alternar')?.addEventListener('click', () => {
		authModoCadastro = !authModoCadastro;
		contaAtualizarModoAuth();
	});
	document.getElementById('auth-enviar')?.addEventListener('click', contaEnviarAuth);
	document.getElementById('conta-sair')?.addEventListener('click', contaSair);
	document.getElementById('auth-esqueci-senha')?.addEventListener('click', abrirRecuperarSenha);
	document.getElementById('recuperar-voltar')?.addEventListener('click', fecharRecuperarSenha);
	document.getElementById('recuperar-enviar')?.addEventListener('click', contaEnviarRecuperacao);
	document.getElementById('confirmar-enviar')?.addEventListener('click', contaEnviarConfirmacao);
	document.getElementById('confirmar-reenviar')?.addEventListener('click', contaReenviarCodigoCadastro);
	document.getElementById('confirmar-voltar')?.addEventListener('click', fecharConfirmarCadastro);

	document.querySelectorAll('.pedido-filtro-chip').forEach(chip => {
		chip.addEventListener('click', () => filtrarPedidos(chip.dataset.status));
	});

	document.getElementById('pedidos-list')?.addEventListener('click', event => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const btn = target.closest('button[data-action]');
		if (!btn) return;
		const id = Number(btn.dataset.pedidoId);
		const action = btn.dataset.action;
		if (action === 'pagar' && id) pagarPedido(id);
		if (action === 'rastrear' && id) rastrearPedido(id);
		if (action === 'abrir-avaliacao' && id) abrirAvaliacao(id);
		if (action === 'cancelar-avaliacao') cancelarAvaliacao();
		if (action === 'definir-nota' && id) definirNotaAvaliacao(Number(btn.dataset.nota));
		if (action === 'enviar-avaliacao' && id) enviarAvaliacao(id);
		if (action === 'comprar-novamente' && id) contaComprarNovamente(id);
	});

	document.querySelectorAll('[data-ir-para]').forEach(btn => {
		btn.addEventListener('click', () => {
			document.querySelector(`.conta-tab[aria-controls="${btn.dataset.irPara}"]`)?.click();
			document.getElementById(btn.dataset.irPara)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	});

	document.getElementById('conta-salvar-dados')?.addEventListener('click', salvarDadosConta);

	document.getElementById('endereco-abrir-form')?.addEventListener('click', abrirFormEndereco);
	document.getElementById('endereco-cancelar')?.addEventListener('click', fecharFormEndereco);
	document.getElementById('endereco-salvar')?.addEventListener('click', salvarEndereco);

	document.getElementById('enderecos-list')?.addEventListener('click', event => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const btn = target.closest('[data-action="remover-endereco"]');
		if (!btn) return;
		const id = Number(btn.dataset.enderecoId);
		if (id) removerEndereco(id);
	});

	document.getElementById('anuncio-bazar-abrir-form')?.addEventListener('click', abrirFormAnuncioBazar);
	document.getElementById('anuncio-bazar-cancelar')?.addEventListener('click', fecharFormAnuncioBazar);
	document.getElementById('anuncio-bazar-salvar')?.addEventListener('click', salvarAnuncioBazar);
	document.getElementById('anuncios-bazar-list')?.addEventListener('click', event => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const btn = target.closest('[data-action="remover-anuncio-bazar"]');
		if (!btn) return;
		removerAnuncioBazar(btn.dataset.anuncioId);
	});

	document.getElementById('anuncio-servico-abrir-form')?.addEventListener('click', abrirFormAnuncioServico);
	document.getElementById('anuncio-servico-cancelar')?.addEventListener('click', fecharFormAnuncioServico);
	document.getElementById('anuncio-servico-salvar')?.addEventListener('click', salvarAnuncioServico);
	document.getElementById('anuncios-servicos-list')?.addEventListener('click', event => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const btn = target.closest('[data-action="remover-anuncio-servico"]');
		if (!btn) return;
		removerAnuncioServico(btn.dataset.anuncioId);
	});

	if (contaObterSessao()) {
		contaIniciarSessaoLogada();
	} else {
		document.getElementById('painel-auth').classList.remove('conta-panel--hidden');
	}
}

document.addEventListener('DOMContentLoaded', bindConta);
