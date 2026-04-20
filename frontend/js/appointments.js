requireAuth();
updateNavbarEvent();

const eventId = localStorage.getItem('selectedEventId');
let appointmentModal;
let allAppointments = [];

document.addEventListener('DOMContentLoaded', () => {
  appointmentModal = new bootstrap.Modal(document.getElementById('appointmentModal'));
  if (!requireEvent()) return;
  loadAppointments();
});

async function loadAppointments() {
  const res = await apiFetch(`/api/appointments?event_id=${eventId}`);
  if (!res) return;
  allAppointments = await res.json();
  const tbody = document.getElementById('appointments-table');
  if (allAppointments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Nenhum compromisso registrado.</td></tr>';
    return;
  }
  const today = new Date().toISOString().split('T')[0];
  tbody.innerHTML = allAppointments.map(a => {
    const isPast = a.date < today;
    return `
      <tr class="${isPast ? 'table-secondary' : ''}">
        <td class="fw-semibold">${a.title}${isPast ? ' <span class="badge bg-secondary ms-1">passado</span>' : ''}</td>
        <td>${formatDate(a.date)}</td>
        <td>${a.time || '—'}</td>
        <td>${a.location || '—'}</td>
        <td>${a.description ? `<small class="text-muted">${a.description}</small>` : '—'}</td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-secondary" onclick="openEditModal(${a.id})"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteAppointment(${a.id})"><i class="bi bi-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openCreateModal() {
  document.getElementById('appointmentModalTitle').textContent = 'Novo Compromisso';
  document.getElementById('appointment-form').reset();
  document.getElementById('appointment-id').value = '';
}

async function openEditModal(id) {
  const a = allAppointments.find(x => x.id === id);
  if (!a) { showToast('Compromisso não encontrado', 'danger'); return; }
  document.getElementById('appointmentModalTitle').textContent = 'Editar Compromisso';
  document.getElementById('appointment-id').value = a.id;
  document.getElementById('appointment-title').value = a.title;
  document.getElementById('appointment-date').value = a.date;
  document.getElementById('appointment-time').value = a.time || '';
  document.getElementById('appointment-location').value = a.location || '';
  document.getElementById('appointment-description').value = a.description || '';
  appointmentModal.show();
}

async function saveAppointment() {
  const id = document.getElementById('appointment-id').value;
  const body = {
    title: document.getElementById('appointment-title').value.trim(),
    date: document.getElementById('appointment-date').value,
    time: document.getElementById('appointment-time').value || null,
    location: document.getElementById('appointment-location').value.trim() || null,
    description: document.getElementById('appointment-description').value.trim() || null,
    event_id: eventId,
  };
  if (!body.title || !body.date) { showToast('Título e data são obrigatórios', 'warning'); return; }
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/appointments/${id}` : '/api/appointments';
  const res = await apiFetch(url, { method, body: JSON.stringify(body) });
  if (!res) return;
  const data = await res.json();
  if (!res.ok) { showToast(data.error || 'Erro ao salvar', 'danger'); return; }
  showToast(id ? 'Compromisso atualizado!' : 'Compromisso registrado!');
  appointmentModal.hide();
  loadAppointments();
}

async function deleteAppointment(id) {
  if (!confirm('Excluir este compromisso?')) return;
  const res = await apiFetch(`/api/appointments/${id}`, { method: 'DELETE' });
  if (!res) return;
  if (res.ok) { showToast('Compromisso excluído!'); loadAppointments(); }
  else { const d = await res.json(); showToast(d.error || 'Erro ao excluir', 'danger'); }
}
