'use strict';

/* =========================================================
   MEGA DISTRITO — PAINEL DO ENTREGADOR (HTML/entregador.html)
   Mapa estilo Uber/99: entregas disponíveis, aceitar, navegar
   até a loja e depois até o cliente, com faixa de manobra
   turn-by-turn (rota + passos vêm do OSRM, serviço público
   gratuito — ver buscarRota()).
   ========================================================= */

const ENT_CENTRO_PADRAO = { lat: -22.6656, lng: -43.0393 }; // Magé - RJ
const ENT_INTERVALO_POLL_MS = 8000;
const ENT_INTERVALO_MIN_ENVIO_POSICAO_MS = 8000;
const ENT_DISTANCIA_MANOBRA_M = 30; // avança para o próximo passo quando chega perto

const entState = {
    usuario: null,
    entregador: null,
    map: null,
    markerEntregador: null,
    markersPedidos: [],
    markerDestino: null,
    routeLine: null,
    pos: null,
    watchId: null,
    pollId: null,
    ultimoEnvioPosicaoEm: 0,
    pedidoAtivo: null,
    navSteps: null,
    navStepIndex: 0,
};

document.addEventListener('DOMContentLoaded', iniciarPaginaEntregador);

async function iniciarPaginaEntregador() {
    const usuario = contaObterSessao();
    if (!usuario || !usuario.id) {
        document.getElementById('ent-login-necessario').hidden = false;
        return;
    }
    entState.usuario = usuario;

    const entregador = await fetchEntregadorPorUsuario(usuario.id);
    if (!entregador || entregador.erro) {
        document.getElementById('ent-onboarding').hidden = false;
        document.getElementById('ent-onboarding-form').addEventListener('submit', enviarCadastroEntregador);
        return;
    }

    entState.entregador = entregador;
    await iniciarPainelEntregador();
}

async function enviarCadastroEntregador(evento) {
    evento.preventDefault();
    const veiculo = document.getElementById('ent-veiculo').value;
    const placa = document.getElementById('ent-placa').value.trim() || null;

    const entregador = await cadastrarEntregador({ usuario_id: entState.usuario.id, veiculo, placa });
    if (!entregador || entregador.erro) {
        toast('Não foi possível concluir o cadastro. Tente novamente.');
        return;
    }

    entState.entregador = entregador;
    document.getElementById('ent-onboarding').hidden = true;
    toast('Cadastro concluído! Você já pode ficar online.');
    await iniciarPainelEntregador();
}

async function iniciarPainelEntregador() {
    const painel = document.getElementById('ent-painel');
    painel.hidden = false;

    const rotulosVeiculo = { moto: 'Moto', bike: 'Bicicleta', carro: 'Carro', a_pe: 'A pé' };
    const iconesVeiculo = { moto: 'fa-motorcycle', bike: 'fa-bicycle', carro: 'fa-car', a_pe: 'fa-person-walking' };
    document.getElementById('ent-veiculo-badge').innerHTML = `<i class="fas ${iconesVeiculo[entState.entregador.veiculo] || 'fa-motorcycle'}"></i>`;
    document.getElementById('ent-nome-entregador').textContent = entState.usuario.nome || 'Entregador';
    atualizarTextoStatus(!!entState.entregador.disponivel);

    inicializarMapa();
    focarLocalizacaoInicial();

    const toggle = document.getElementById('ent-toggle-online');
    toggle.checked = !!entState.entregador.disponivel;
    toggle.addEventListener('change', () => alternarOnline(toggle.checked));

    document.getElementById('ent-ativa-confirmar').addEventListener('click', confirmarEtapaAtiva);

    const entregaAtual = await fetchEntregaAtual(entState.entregador.id);
    if (entregaAtual && entregaAtual.id) {
        entState.pedidoAtivo = entregaAtual;
    }

    if (toggle.checked) {
        iniciarModoOnline();
    } else {
        document.getElementById('ent-offline-overlay').classList.remove('hidden');
    }
}

function atualizarTextoStatus(online) {
    const texto = document.getElementById('ent-status-texto');
    texto.textContent = online ? 'Online — buscando entregas' : 'Offline';
    texto.classList.toggle('ent-status-online', online);
    document.getElementById('ent-toggle-label').textContent = online ? 'Online' : 'Ficar online';
}

/* ── Mapa ── */
function inicializarMapa() {
    const centro = entState.entregador.lat && entState.entregador.lng
        ? { lat: Number(entState.entregador.lat), lng: Number(entState.entregador.lng) }
        : ENT_CENTRO_PADRAO;

    entState.map = L.map('ent-map', { zoomControl: true }).setView([centro.lat, centro.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
    }).addTo(entState.map);
}

function iconeDivMapa(classe, iconeFa) {
    return L.divIcon({
        className: '',
        html: `<div class="${classe}">${iconeFa ? `<i class="fas ${iconeFa}"></i>` : ''}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });
}

/* Marcador do entregador: bolinha azul + seta de direção (heading do GPS),
   estilo Uber/Google Maps. Sem heading (parado ou sem suporte), mostra só a bolinha. */
function iconeEntregador(heading) {
    const temHeading = heading != null && !Number.isNaN(heading);
    return L.divIcon({
        className: '',
        html: `
            <div class="ent-marker-entregador-wrap">
                ${temHeading ? `<div class="ent-marker-heading" style="transform: rotate(${heading}deg)"><i class="fas fa-caret-up"></i></div>` : ''}
                <div class="ent-marker-entregador"></div>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
}

function atualizarMarcadorEntregador(lat, lng, heading) {
    const icone = iconeEntregador(heading);
    if (!entState.markerEntregador) {
        entState.markerEntregador = L.marker([lat, lng], { icon: icone }).addTo(entState.map);
    } else {
        entState.markerEntregador.setLatLng([lat, lng]);
        entState.markerEntregador.setIcon(icone);
    }
}

/* Foca o mapa na localização atual assim que a página abre, mesmo antes de
   ficar online — mostra logo onde o entregador está, como um app de navegação. */
function focarLocalizacaoInicial() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
        posicao => {
            const { latitude: lat, longitude: lng, heading } = posicao.coords;
            entState.pos = entState.pos || { lat, lng };
            entState.map.setView([lat, lng], 16);
            atualizarMarcadorEntregador(lat, lng, heading);
        },
        erro => console.warn('[entregador] Não foi possível focar a localização inicial:', erro.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
}

/* ── Online / geolocalização ── */
function alternarOnline(online) {
    atualizarDisponibilidadeEntregador(entState.entregador.id, online);
    atualizarTextoStatus(online);
    document.getElementById('ent-offline-overlay').classList.toggle('hidden', online);

    if (online) {
        iniciarModoOnline();
    } else {
        pararModoOnline();
        document.getElementById('ent-disponiveis').hidden = true;
    }
}

function iniciarModoOnline() {
    if (!navigator.geolocation) {
        toast('Seu navegador não suporta geolocalização.');
        return;
    }
    if (entState.watchId == null) {
        entState.watchId = navigator.geolocation.watchPosition(aoAtualizarPosicao, aoErrarGeolocalizacao, {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 15000,
        });
    }

    if (entState.pedidoAtivo) {
        renderizarEntregaAtiva();
    } else {
        iniciarPollingDisponiveis();
    }
}

function pararModoOnline() {
    if (entState.watchId != null) {
        navigator.geolocation.clearWatch(entState.watchId);
        entState.watchId = null;
    }
    pararPollingDisponiveis();
}

function aoErrarGeolocalizacao(erro) {
    console.warn('[entregador] geolocalização:', erro.message);
    toast('Não foi possível obter sua localização. Verifique a permissão de GPS.');
}

function aoAtualizarPosicao(posicao) {
    const lat = posicao.coords.latitude;
    const lng = posicao.coords.longitude;
    entState.pos = { lat, lng };

    atualizarMarcadorEntregador(lat, lng, posicao.coords.heading);

    const agora = Date.now();
    if (agora - entState.ultimoEnvioPosicaoEm >= ENT_INTERVALO_MIN_ENVIO_POSICAO_MS) {
        entState.ultimoEnvioPosicaoEm = agora;
        atualizarPosicaoEntregador(entState.entregador.id, lat, lng);
    }

    if (entState.pedidoAtivo) {
        if (!entState.routeLine && entState.destinoAtivo) {
            atualizarRotaAtiva(entState.destinoAtivo);
        } else {
            atualizarProgressoNavegacao();
        }
    }
}

/* ── Distância (Haversine, em metros) ── */
function entDistanciaMetros(a, b) {
    const R = 6371000;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

/* ── Entregas disponíveis ── */
function iniciarPollingDisponiveis() {
    document.getElementById('ent-disponiveis').hidden = false;
    document.getElementById('ent-ativa').hidden = true;
    carregarEntregasDisponiveis();
    pararPollingDisponiveis();
    entState.pollId = setInterval(carregarEntregasDisponiveis, ENT_INTERVALO_POLL_MS);
}

function pararPollingDisponiveis() {
    if (entState.pollId != null) {
        clearInterval(entState.pollId);
        entState.pollId = null;
    }
}

async function carregarEntregasDisponiveis() {
    if (entState.pedidoAtivo) return;
    const pos = entState.pos;
    const lista = await fetchEntregasDisponiveis(pos && pos.lat, pos && pos.lng);
    renderizarListaDisponiveis(Array.isArray(lista) ? lista : []);
}

function renderizarListaDisponiveis(lista) {
    entState.markersPedidos.forEach(m => entState.map.removeLayer(m));
    entState.markersPedidos = [];

    document.getElementById('ent-disponiveis-count').textContent = lista.length;
    document.getElementById('ent-disponiveis-vazio').hidden = lista.length > 0;

    const container = document.getElementById('ent-disponiveis-lista');
    container.innerHTML = lista.map(p => {
        const distancia = p.distancia_km != null ? `${Number(p.distancia_km).toFixed(1)} km` : '';
        return `
            <article class="ent-entrega-card" data-pedido-id="${p.id}">
                <div class="ent-entrega-card-info">
                    <div class="ent-entrega-card-loja">${escapeHtml(p.loja_nome)}</div>
                    <div class="ent-entrega-card-meta">
                        <span><i class="fas fa-box"></i> ${escapeHtml(p.item_nome)}</span>
                        ${distancia ? `<span><i class="fas fa-route"></i> ${distancia}</span>` : ''}
                        ${p.cliente_bairro ? `<span><i class="fas fa-location-dot"></i> ${escapeHtml(p.cliente_bairro)}</span>` : ''}
                    </div>
                </div>
                <div class="ent-entrega-card-valor">${brl(Number(p.valor))}</div>
                <button type="button" data-aceitar="${p.id}">Aceitar</button>
            </article>
        `;
    }).join('');

    container.querySelectorAll('[data-aceitar]').forEach(botao => {
        botao.addEventListener('click', () => aceitarEntregaClique(Number(botao.dataset.aceitar), botao));
    });

    if (!entState.pedidoAtivo) {
        lista.forEach(p => {
            if (p.loja_lat && p.loja_lng) {
                const marcador = L.marker([Number(p.loja_lat), Number(p.loja_lng)], {
                    icon: iconeDivMapa('ent-marker-pedido', 'fa-box'),
                }).addTo(entState.map).bindPopup(escapeHtml(p.loja_nome));
                entState.markersPedidos.push(marcador);
            }
        });
    }
}

async function aceitarEntregaClique(pedidoId, botao) {
    botao.disabled = true;
    botao.textContent = 'Aceitando…';

    const resultado = await aceitarEntrega(pedidoId, entState.entregador.id);
    if (!resultado || resultado.erro) {
        toast(resultado && resultado.erro ? resultado.erro : 'Não foi possível aceitar esta entrega.');
        carregarEntregasDisponiveis();
        return;
    }

    toast('Entrega aceita! Siga até a loja.');
    pararPollingDisponiveis();
    entState.pedidoAtivo = await fetchEntregaAtual(entState.entregador.id);
    document.getElementById('ent-disponiveis').hidden = true;
    renderizarEntregaAtiva();
}

/* ── Entrega ativa (retirada na loja / entrega ao cliente) ── */
function renderizarEntregaAtiva() {
    const pedido = entState.pedidoAtivo;
    if (!pedido) return;

    document.getElementById('ent-ativa').hidden = false;
    document.getElementById('ent-disponiveis').hidden = true;

    const indoRetirar = pedido.status === 'preparando';
    const etapaEl = document.getElementById('ent-ativa-etapa');
    etapaEl.textContent = indoRetirar ? 'Indo até a loja' : 'Indo até o cliente';
    etapaEl.classList.toggle('ent-etapa-entregando', !indoRetirar);

    document.getElementById('ent-ativa-icone').className = indoRetirar ? 'fas fa-store' : 'fas fa-house';
    document.getElementById('ent-ativa-item').textContent = pedido.item_nome || '';
    document.getElementById('ent-ativa-valor').textContent = brl(Number(pedido.valor));

    let destino = null;
    let enderecoTexto = '';
    if (indoRetirar) {
        document.getElementById('ent-ativa-nome-local').textContent = pedido.loja_nome || 'Loja';
        enderecoTexto = pedido.loja_endereco || '';
        if (pedido.loja_lat && pedido.loja_lng) destino = { lat: Number(pedido.loja_lat), lng: Number(pedido.loja_lng) };
    } else {
        document.getElementById('ent-ativa-nome-local').textContent = pedido.cliente_nome || 'Cliente';
        enderecoTexto = [pedido.cliente_rua, pedido.cliente_bairro, pedido.cliente_cidade].filter(Boolean).join(', ');
        if (pedido.cliente_lat && pedido.cliente_lng) destino = { lat: Number(pedido.cliente_lat), lng: Number(pedido.cliente_lng) };
    }
    document.getElementById('ent-ativa-endereco').textContent = enderecoTexto || 'Endereço não informado';

    const linkMaps = document.getElementById('ent-ativa-maps');
    linkMaps.href = destino
        ? `https://www.google.com/maps/dir/?api=1&destination=${destino.lat},${destino.lng}`
        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(enderecoTexto)}`;

    const confirmarBtn = document.getElementById('ent-ativa-confirmar');
    confirmarBtn.innerHTML = indoRetirar
        ? '<i class="fas fa-check"></i> Retirei o pedido'
        : '<i class="fas fa-check-double"></i> Entreguei';

    if (entState.markerDestino) { entState.map.removeLayer(entState.markerDestino); entState.markerDestino = null; }
    if (destino) {
        entState.markerDestino = L.marker([destino.lat, destino.lng], {
            icon: iconeDivMapa('ent-marker-destino', indoRetirar ? 'fa-store' : 'fa-house'),
        }).addTo(entState.map);
    }

    entState.destinoAtivo = destino;
    atualizarRotaAtiva(destino);
}

async function atualizarRotaAtiva(destino) {
    if (entState.buscandoRota) return;
    limparRota();
    if (!entState.pos || !destino) {
        document.getElementById('ent-nav-banner').hidden = true;
        return;
    }

    entState.buscandoRota = true;
    const rota = await buscarRota(entState.pos, destino);
    entState.buscandoRota = false;
    if (rota) {
        entState.routeLine = L.geoJSON(rota.geometry, { style: { color: '#0288d1', weight: 5 } }).addTo(entState.map);
        entState.map.fitBounds(entState.routeLine.getBounds(), { padding: [30, 30] });

        const passos = rota.steps || [];
        entState.navSteps = passos;
        entState.navStepIndex = passos.length > 1 ? 1 : 0;
        atualizarProgressoNavegacao();
    } else {
        entState.routeLine = L.polyline([[entState.pos.lat, entState.pos.lng], [destino.lat, destino.lng]], {
            color: '#0288d1', weight: 4, dashArray: '8 8',
        }).addTo(entState.map);
        entState.map.fitBounds(entState.routeLine.getBounds(), { padding: [30, 30] });
        entState.navSteps = null;
        document.getElementById('ent-nav-banner').hidden = true;
    }
}

function limparRota() {
    if (entState.routeLine) { entState.map.removeLayer(entState.routeLine); entState.routeLine = null; }
    entState.navSteps = null;
    entState.navStepIndex = 0;
}

/* ── Rota + passos via OSRM (gratuito, sem chave) ──
   Se o serviço demo falhar, quem chamou usa fallback de linha reta. */
async function buscarRota(origem, destino) {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origem.lng},${origem.lat};${destino.lng},${destino.lat}?overview=full&geometries=geojson&steps=true`;
        const resp = await fetch(url);
        const dados = await resp.json();
        if (dados.code !== 'Ok' || !dados.routes || !dados.routes.length) return null;

        const rota = dados.routes[0];
        return { geometry: rota.geometry, steps: rota.legs[0].steps };
    } catch (erro) {
        console.warn('[entregador] Falha ao buscar rota (OSRM):', erro.message);
        return null;
    }
}

/* ── Faixa de navegação turn-by-turn (estilo Waze/Uber) ── */
const ENT_MANOBRA_ICONE = {
    'turn-left': 'fa-arrow-left', 'turn-right': 'fa-arrow-right',
    'turn-slight left': 'fa-arrow-up', 'turn-slight right': 'fa-arrow-up',
    'turn-sharp left': 'fa-arrow-left', 'turn-sharp right': 'fa-arrow-right',
    'turn-straight': 'fa-arrow-up', 'turn-uturn': 'fa-rotate-left',
    depart: 'fa-arrow-up', arrive: 'fa-flag-checkered',
    roundabout: 'fa-rotate', rotary: 'fa-rotate',
    merge: 'fa-arrow-up', 'new name': 'fa-arrow-up', fork: 'fa-code-fork',
};

function textoManobra(passo) {
    const nome = passo.name || 'via sem nome';
    const tipo = passo.maneuver.type;
    const mod = passo.maneuver.modifier;

    if (tipo === 'depart') return `Siga em frente na ${nome}`;
    if (tipo === 'arrive') return 'Você chegou ao destino';
    if (tipo === 'roundabout' || tipo === 'rotary') return `Entre na rotatória e siga na ${nome}`;
    if (tipo === 'turn' && mod === 'straight') return `Siga em frente na ${nome}`;
    if (tipo === 'turn' && mod === 'uturn') return `Faça o retorno na ${nome}`;
    if (tipo === 'turn') return `Vire à ${mod && mod.includes('left') ? 'esquerda' : 'direita'} na ${nome}`;
    return `Continue na ${nome}`;
}

function iconeManobra(passo) {
    const chave = passo.maneuver.type === 'turn' ? `turn-${passo.maneuver.modifier}` : passo.maneuver.type;
    return ENT_MANOBRA_ICONE[chave] || 'fa-arrow-up';
}

function atualizarProgressoNavegacao() {
    const banner = document.getElementById('ent-nav-banner');
    if (!entState.navSteps || !entState.navSteps.length || !entState.pos) {
        banner.hidden = true;
        return;
    }

    let indice = entState.navStepIndex;
    const passos = entState.navSteps;
    let passo = passos[indice];
    if (!passo) { banner.hidden = true; return; }

    const localManobra = { lat: passo.maneuver.location[1], lng: passo.maneuver.location[0] };
    let distancia = entDistanciaMetros(entState.pos, localManobra);

    if (distancia < ENT_DISTANCIA_MANOBRA_M && passo.maneuver.type !== 'arrive' && indice < passos.length - 1) {
        indice += 1;
        entState.navStepIndex = indice;
        passo = passos[indice];
        distancia = entDistanciaMetros(entState.pos, { lat: passo.maneuver.location[1], lng: passo.maneuver.location[0] });
    }

    banner.hidden = false;
    document.getElementById('ent-nav-icon').innerHTML = `<i class="fas ${iconeManobra(passo)}"></i>`;
    document.getElementById('ent-nav-instrucao').textContent = textoManobra(passo);
    document.getElementById('ent-nav-distancia').textContent = passo.maneuver.type === 'arrive'
        ? ''
        : `Em ${distancia < 1000 ? `${Math.round(distancia)} m` : `${(distancia / 1000).toFixed(1)} km`}`;
}

/* ── Confirmação de etapa (retirar na loja / entregar ao cliente) ── */
async function confirmarEtapaAtiva() {
    const pedido = entState.pedidoAtivo;
    if (!pedido) return;

    const indoRetirar = pedido.status === 'preparando';
    const resultado = indoRetirar
        ? await confirmarRetiradaEntrega(pedido.id)
        : await confirmarEntregaCliente(pedido.id);

    if (!resultado) {
        toast('Não foi possível atualizar a entrega. Tente novamente.');
        return;
    }

    if (indoRetirar) {
        toast('Retirada confirmada! Siga até o cliente.');
        entState.pedidoAtivo = await fetchEntregaAtual(entState.entregador.id);
        renderizarEntregaAtiva();
    } else {
        toast('Entrega concluída! Obrigado.');
        entState.pedidoAtivo = null;
        limparRota();
        if (entState.markerDestino) { entState.map.removeLayer(entState.markerDestino); entState.markerDestino = null; }
        document.getElementById('ent-nav-banner').hidden = true;
        document.getElementById('ent-ativa').hidden = true;
        iniciarPollingDisponiveis();
    }
}
