'use strict';

/* =========================================================
   MEGA DISTRITO — Utilidades Compartilhadas
   Carregar ANTES de qualquer outro script, em todas as páginas.
   ========================================================= */

/** Formata um número como moeda brasileira (R$) */
function brl(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Remove acentos e converte para minúsculas (para buscas e filtros) */
function normalizar(txt) {
    return (txt || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');
}

/** Converte um DATETIME do backend ("2026-07-10 14:00:00") em texto relativo ("Hoje", "Ontem", "Há 3 dias") */
function tempoRelativo(dataStr) {
    if (!dataStr) return '';
    const data = new Date(dataStr.replace(' ', 'T'));
    if (Number.isNaN(data.getTime())) return '';

    const dias = Math.floor((Date.now() - data.getTime()) / 86400000);
    if (dias <= 0) return 'Hoje';
    if (dias === 1) return 'Ontem';
    return `Há ${dias} dias`;
}

/* ─────────────────────────────────────────────
   TOAST NOTIFICATION — exige um elemento #toast
   ───────────────────────────────────────────── */
let toastTimer = null;
function toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}
