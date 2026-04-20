requireAuth();
updateNavbarEvent();

let eventModal;

document.addEventListener('DOMContentLoaded', () => {
  eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
  loadEvents();
});

async function loadEvents() {
  const res = await apiFetch('/api/events');
  if (!res) return;
  const events = await res.json();
  const tbody = document.getElementById('events-table');
  if (events.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Nenhum evento cadastrado. Clique em "Novo Evento" para começar.</td></tr>';
    return;
  }
  tbody.innerHTML = events.map(ev => `
    <tr>
      <td class="fw-semibold">${ev.name}</td>
      <td>${formatDate(ev.date)}</td>
      <td>${ev.location}</td>
      <td>${formatCurrency(ev.budget)}</td>
      <td><span class="status-badge badge-${ev.status}">${ev.status}</span></td>
      <td>
        <div class="d-flex gap-1 flex-wrap">
              <button class="btn btn-sm btn-outline-primary" title="Selecionar evento"
            data-event-id="${parseInt(ev.id, 10)}" data-event-name="${ev.name.replace(/"/g, '&quot;')}"
            onclick="selectEvent(this.dataset.eventId, this.dataset.eventName)">
            <i class="bi bi-star"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary" title="Editar" onclick="openEditModal(${ev.id})">
            <i class="bi bi-pencil"></i>
          </button>
          ${ev.status === 'ativo' ? `
          <button class="btn btn-sm btn-outline-warning" title="Encerrar evento" onclick="closeEvent(${ev.id})">
            <i class="bi bi-lock"></i>
          </button>` : ''}
          <button class="btn btn-sm btn-outline-danger" title="Excluir" onclick="deleteEvent(${ev.id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openCreateModal() {
  document.getElementById('eventModalTitle').textContent = 'Novo Evento';
  document.getElementById('event-form').reset();
  document.getElementById('event-id').value = '';
}

async function openEditModal(id) {
  const res = await apiFetch(`/api/events/${id}`);
  if (!res || !res.ok) { showToast('Erro ao carregar evento', 'danger'); return; }
  const ev = await res.json();
  document.getElementById('eventModalTitle').textContent = 'Editar Evento';
  document.getElementById('event-id').value = ev.id;
  document.getElementById('event-name').value = ev.name;
  document.getElementById('event-date').value = ev.date;
  document.getElementById('event-location').value = ev.location;
  document.getElementById('event-budget').value = ev.budget;
  document.getElementById('event-description').value = ev.description || '';
  eventModal.show();
}

async function saveEvent() {
  const id = document.getElementById('event-id').value;
  const body = {
    name: document.getElementById('event-name').value.trim(),
    date: document.getElementById('event-date').value,
    location: document.getElementById('event-location').value.trim(),
    budget: parseFloat(document.getElementById('event-budget').value) || 0,
    description: document.getElementById('event-description').value.trim(),
  };
  if (!body.name || !body.date || !body.location) {
    showToast('Preencha os campos obrigatórios', 'warning'); return;
  }
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/events/${id}` : '/api/events';
  const res = await apiFetch(url, { method, body: JSON.stringify(body) });
  if (!res) return;
  const data = await res.json();
  if (!res.ok) { showToast(data.error || 'Erro ao salvar evento', 'danger'); return; }
  showToast(id ? 'Evento atualizado!' : 'Evento criado!');
  eventModal.hide();
  loadEvents();
}

async function closeEvent(id) {
  if (!confirm('Deseja encerrar este evento?')) return;
  const res = await apiFetch(`/api/events/${id}/close`, { method: 'PATCH' });
  if (!res) return;
  if (res.ok) { showToast('Evento encerrado!'); loadEvents(); }
  else { const d = await res.json(); showToast(d.error || 'Erro ao encerrar', 'danger'); }
}

async function deleteEvent(id) {
  if (!confirm('Excluir este evento e todos os dados relacionados?')) return;
  const res = await apiFetch(`/api/events/${id}`, { method: 'DELETE' });
  if (!res) return;
  if (res.ok) {
    if (localStorage.getItem('selectedEventId') === String(id)) {
      localStorage.removeItem('selectedEventId');
      localStorage.removeItem('selectedEventName');
      updateNavbarEvent();
    }
    showToast('Evento excluído!');
    loadEvents();
  } else {
    const d = await res.json(); showToast(d.error || 'Erro ao excluir', 'danger');
  }
}

function selectEvent(id, name) {
  localStorage.setItem('selectedEventId', id);
  localStorage.setItem('selectedEventName', name);
  updateNavbarEvent();
  showToast(`Evento "${name}" selecionado!`);
}
