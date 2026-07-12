'use strict';

/* =========================================================
   MAGÉ EXPRESS — DADOS: CATÁLOGO DA LOJA DE APPS
   Cada entrada é um "mini-app" que aparece na gaveta de apps.
   Estabelecimentos com página própria devem apontar `url`
   para HTML/loja.html?id=<slug> (ver JS/data/lojas.js).
   ========================================================= */

const LOJA_APPS = [
    {
        id: 1,
        nome: 'Mercado Express',
        loja: 'Magé Express',
        desc: 'Ofertas rapidas e produtos em destaque da semana.',
        icone: 'fas fa-bolt',
        cor: '#2e7d32',
        categoria: 'mercado',
        url: '#produtos',
    },
    {
        id: 2,
        nome: 'Bazar Local',
        loja: 'Vendedores da Regiao',
        desc: 'Compre usados em bom estado direto com vendedores locais.',
        icone: 'fas fa-recycle',
        cor: '#ef6c00',
        categoria: 'bazar',
        url: '#bazar',
    },
    {
        id: 3,
        nome: 'Servicos Pro',
        loja: 'Prestadores',
        desc: 'Encontre profissionais para eletrica, limpeza, reformas e mais.',
        icone: 'fas fa-hard-hat',
        cor: '#1565c0',
        categoria: 'servicos',
        url: 'HTML/servicos.html',
    },
    {
        id: 4,
        nome: 'Feed da Cidade',
        loja: 'Comunidade',
        desc: 'Novidades, postagens e anuncios da comunidade de Mage.',
        icone: 'fas fa-stream',
        cor: '#00897b',
        categoria: 'comunidade',
        url: 'HTML/feed.html',
    },
    {
        id: 5,
        nome: 'Farmacia 24h',
        loja: 'Drogaria Central',
        desc: 'Entrega de remedios e itens de farmacia para todo o municipio.',
        icone: 'fas fa-clinic-medical',
        cor: '#8e24aa',
        categoria: 'saude',
        url: '#',
    },
    {
        id: 6,
        nome: 'Pet Shop Magico',
        loja: 'Mundo Pet',
        desc: 'Racao, banho e tosa, e itens para seu pet em um clique.',
        icone: 'fas fa-paw',
        cor: '#5d4037',
        categoria: 'pets',
        url: '#',
    },
];
