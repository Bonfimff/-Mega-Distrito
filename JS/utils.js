'use strict';

/* =========================================================
   MAGÉ EXPRESS — Utilidades Compartilhadas
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
