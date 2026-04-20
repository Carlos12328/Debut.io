const API_BASE = '';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE + path, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedEventId');
    localStorage.removeItem('selectedEventName');
    window.location.href = '/index.html';
    return;
  }
  return res;
}

function formatDate(isoDate) {
  if (!isoDate) return '-';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const id = 'toast-' + Date.now();
  const bgClass = type === 'success' ? 'bg-success' : (type === 'danger' ? 'bg-danger' : 'bg-warning');
  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center text-white ${bgClass} border-0 mb-2" role="alert" aria-live="assertive">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `);
  const toastEl = document.getElementById(id);
  const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

function requireEvent() {
  const eventId = localStorage.getItem('selectedEventId');
  if (!eventId) {
    showToast('Selecione um evento no Dashboard primeiro.', 'warning');
    setTimeout(() => { window.location.href = '/dashboard.html'; }, 1500);
    return false;
  }
  return true;
}

function updateNavbarEvent() {
  const name = localStorage.getItem('selectedEventName');
  const el = document.getElementById('current-event-name');
  if (el) el.textContent = name || 'Nenhum selecionado';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('selectedEventId');
  localStorage.removeItem('selectedEventName');
  window.location.href = '/index.html';
}
