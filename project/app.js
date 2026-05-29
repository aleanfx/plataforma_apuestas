/* ============================================================
   VegasVE — interacción: router de vistas, modales, toasts
   ============================================================ */

/* ---- View router ---- */
function go(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById('view-' + view);
  if (el) el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'auto' : 'auto' });
  // nav state: show logged-in chrome on lobby/profile
  const loggedIn = (view === 'lobby' || view === 'profile');
  document.body.dataset.auth = loggedIn ? 'in' : 'out';
}

/* ---- Modal control ---- */
function openModal(id, tab) {
  const m = document.getElementById('modal-' + id);
  if (!m) return;
  m.classList.add('open');
  if (id === 'auth' && tab) switchAuthTab(tab);
  document.body.style.overflow = 'hidden';
}
function closeModal(el) {
  const scrim = el.closest ? el.closest('.modal-scrim') : document.getElementById('modal-' + el);
  if (scrim) scrim.classList.remove('open');
  document.body.style.overflow = '';
}
function closeAll() {
  document.querySelectorAll('.modal-scrim.open').forEach(m => m.classList.remove('open'));
  document.body.style.overflow = '';
}
// click on scrim closes
document.addEventListener('click', e => {
  if (e.target.classList && e.target.classList.contains('modal-scrim')) closeAll();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

/* ---- Auth tabs ---- */
function switchAuthTab(tab) {
  document.querySelectorAll('#modal-auth .tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('auth-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('auth-register').style.display = tab === 'register' ? 'block' : 'none';
  const head = document.getElementById('auth-head');
  head.querySelector('h2').textContent = tab === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta';
  head.querySelector('.msub').textContent = tab === 'login'
    ? 'Ingresa para continuar tu juego.'
    : 'Regístrate en menos de un minuto y recibe tu bono.';
}

function doAuth() {
  closeAll();
  toast('Sesión iniciada — ¡bienvenido!');
  setTimeout(() => go('lobby'), 250);
}

/* ---- Deposit / Withdraw modals ---- */
let selectedMethod = 'binance';
function selectMethod(el, name) {
  el.parentElement.querySelectorAll('.method').forEach(m => m.classList.remove('active'));
  el.classList.add('active');
  selectedMethod = name;
}
function setAmount(modal, val) {
  const input = document.querySelector('#modal-' + modal + ' .amount-input');
  if (input) { input.value = val; updateSummary(modal); }
}
function updateSummary(modal) {
  const input = document.querySelector('#modal-' + modal + ' .amount-input');
  if (!input) return;
  const v = parseFloat(input.value) || 0;
  const usd = (v / 40).toFixed(2); // demo rate 40 Bs/USD
  const usdEl = document.querySelector('#modal-' + modal + ' .sum-usd');
  const totEl = document.querySelector('#modal-' + modal + ' .sum-total');
  if (usdEl) usdEl.textContent = '≈ $' + usd;
  if (totEl) totEl.textContent = 'Bs. ' + v.toLocaleString('es-VE');
}
function confirmTx(kind) {
  closeAll();
  toast(kind === 'deposit' ? 'Depósito en proceso — se reflejará en breve' : 'Solicitud de retiro enviada');
}

/* ---- Toast ---- */
let toastTimer;
function toast(msg) {
  let t = document.getElementById('toast');
  t.querySelector('.tmsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ---- Game launch (demo) ---- */
function playGame(name) {
  toast('Abriendo mesas de ' + name + '…');
}

/* init */
document.addEventListener('DOMContentLoaded', () => {
  go('landing');
  document.body.dataset.auth = 'out';
});
