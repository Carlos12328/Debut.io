requireAuth();
updateNavbarEvent();

const eventId = localStorage.getItem('selectedEventId');
let taskModal;
let allTasks = [];

document.addEventListener('DOMContentLoaded', () => {
  taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
  if (!requireEvent()) return;
  loadTasks();
});

async function loadTasks() {
  const res = await apiFetch(`/api/tasks?event_id=${eventId}`);
  if (!res) return;
  allTasks = await res.json();
  renderKanban();
  renderTable();
}

function renderKanban() {
  const cols = { pendente: [], em_andamento: [], concluida: [] };
  allTasks.forEach(t => {
    if (cols[t.status]) cols[t.status].push(t);
  });
  for (const status of Object.keys(cols)) {
    const colEl = document.getElementById(`col-${status}`);
    if (cols[status].length === 0) {
      colEl.innerHTML = '<p class="text-muted small text-center">Nenhuma tarefa</p>';
    } else {
      colEl.innerHTML = cols[status].map(t => `
        <div class="kanban-card">
          <div class="fw-semibold mb-1">${t.title}</div>
          ${t.description ? `<div class="text-muted small mb-1">${t.description}</div>` : ''}
          ${t.due_date ? `<div class="small text-muted"><i class="bi bi-calendar me-1"></i>${formatDate(t.due_date)}</div>` : ''}
          <div class="d-flex gap-1 mt-2">
            <button class="btn btn-sm btn-outline-secondary" onclick="openEditModal(${t.id})"><i class="bi bi-pencil"></i></button>
            <select class="form-select form-select-sm" style="max-width:130px;" onchange="updateStatus(${t.id}, this.value)">
              <option value="pendente" ${t.status === 'pendente' ? 'selected' : ''}>Pendente</option>
              <option value="em_andamento" ${t.status === 'em_andamento' ? 'selected' : ''}>Em Andamento</option>
              <option value="concluida" ${t.status === 'concluida' ? 'selected' : ''}>Concluída</option>
            </select>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${t.id})"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      `).join('');
    }
  }
}

function renderTable() {
  const tbody = document.getElementById('tasks-table');
  if (allTasks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Nenhuma tarefa cadastrada.</td></tr>';
    return;
  }
  tbody.innerHTML = allTasks.map(t => `
    <tr>
      <td class="fw-semibold">${t.title}</td>
      <td>${t.description ? `<small class="text-muted">${t.description}</small>` : '—'}</td>
      <td>${formatDate(t.due_date)}</td>
      <td><span class="status-badge badge-${t.status}">${t.status.replace('_', ' ')}</span></td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-secondary" onclick="openEditModal(${t.id})"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${t.id})"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openCreateModal() {
  document.getElementById('taskModalTitle').textContent = 'Nova Tarefa';
  document.getElementById('task-form').reset();
  document.getElementById('task-id').value = '';
}

async function openEditModal(id) {
  const task = allTasks.find(t => t.id === id);
  if (!task) { showToast('Tarefa não encontrada', 'danger'); return; }
  document.getElementById('taskModalTitle').textContent = 'Editar Tarefa';
  document.getElementById('task-id').value = task.id;
  document.getElementById('task-title').value = task.title;
  document.getElementById('task-description').value = task.description || '';
  document.getElementById('task-due_date').value = task.due_date || '';
  document.getElementById('task-status').value = task.status;
  taskModal.show();
}

async function saveTask() {
  const id = document.getElementById('task-id').value;
  const body = {
    title: document.getElementById('task-title').value.trim(),
    description: document.getElementById('task-description').value.trim(),
    due_date: document.getElementById('task-due_date').value || null,
    status: document.getElementById('task-status').value,
    event_id: eventId,
  };
  if (!body.title) { showToast('Título é obrigatório', 'warning'); return; }
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/tasks/${id}` : '/api/tasks';
  const res = await apiFetch(url, { method, body: JSON.stringify(body) });
  if (!res) return;
  const data = await res.json();
  if (!res.ok) { showToast(data.error || 'Erro ao salvar', 'danger'); return; }
  showToast(id ? 'Tarefa atualizada!' : 'Tarefa criada!');
  taskModal.hide();
  loadTasks();
}

async function updateStatus(id, status) {
  const res = await apiFetch(`/api/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!res) return;
  if (res.ok) { showToast('Status atualizado!'); loadTasks(); }
  else { const d = await res.json(); showToast(d.error || 'Erro ao atualizar', 'danger'); }
}

async function deleteTask(id) {
  if (!confirm('Excluir esta tarefa?')) return;
  const res = await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
  if (!res) return;
  if (res.ok) { showToast('Tarefa excluída!'); loadTasks(); }
  else { const d = await res.json(); showToast(d.error || 'Erro ao excluir', 'danger'); }
}
