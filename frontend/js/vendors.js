requireAuth();
updateNavbarEvent();

const eventId = localStorage.getItem('selectedEventId');
let vendorModal;

document.addEventListener('DOMContentLoaded', () => {
  vendorModal = new bootstrap.Modal(document.getElementById('vendorModal'));
  if (!requireEvent()) return;
  loadVendors();
});

async function loadVendors() {
  const res = await apiFetch(`/api/vendors?event_id=${eventId}`);
  if (!res) return;
  const vendors = await res.json();
  const tbody = document.getElementById('vendors-table');
  if (vendors.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Nenhum fornecedor cadastrado.</td></tr>';
    return;
  }
  tbody.innerHTML = vendors.map(v => `
    <tr>
      <td class="fw-semibold">${v.name}</td>
      <td><span class="badge bg-secondary">${v.category}</span></td>
      <td>${v.phone || '—'}</td>
      <td>${v.email ? `<a href="mailto:${v.email}">${v.email}</a>` : '—'}</td>
      <td>${v.notes ? `<small class="text-muted">${v.notes}</small>` : '—'}</td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-secondary" onclick="openEditModal(${v.id})"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteVendor(${v.id})"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openCreateModal() {
  document.getElementById('vendorModalTitle').textContent = 'Novo Fornecedor';
  document.getElementById('vendor-form').reset();
  document.getElementById('vendor-id').value = '';
}

async function openEditModal(id) {
  const res = await apiFetch(`/api/vendors/${id}`);
  if (!res || !res.ok) { showToast('Erro ao carregar fornecedor', 'danger'); return; }
  const v = await res.json();
  document.getElementById('vendorModalTitle').textContent = 'Editar Fornecedor';
  document.getElementById('vendor-id').value = v.id;
  document.getElementById('vendor-name').value = v.name;
  document.getElementById('vendor-category').value = v.category;
  document.getElementById('vendor-phone').value = v.phone || '';
  document.getElementById('vendor-email').value = v.email || '';
  document.getElementById('vendor-notes').value = v.notes || '';
  vendorModal.show();
}

async function saveVendor() {
  const id = document.getElementById('vendor-id').value;
  const body = {
    name: document.getElementById('vendor-name').value.trim(),
    category: document.getElementById('vendor-category').value,
    phone: document.getElementById('vendor-phone').value.trim(),
    email: document.getElementById('vendor-email').value.trim(),
    notes: document.getElementById('vendor-notes').value.trim(),
    event_id: eventId,
  };
  if (!body.name || !body.category) { showToast('Nome e categoria são obrigatórios', 'warning'); return; }
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/vendors/${id}` : '/api/vendors';
  const res = await apiFetch(url, { method, body: JSON.stringify(body) });
  if (!res) return;
  const data = await res.json();
  if (!res.ok) { showToast(data.error || 'Erro ao salvar', 'danger'); return; }
  showToast(id ? 'Fornecedor atualizado!' : 'Fornecedor cadastrado!');
  vendorModal.hide();
  loadVendors();
}

async function deleteVendor(id) {
  if (!confirm('Excluir este fornecedor?')) return;
  const res = await apiFetch(`/api/vendors/${id}`, { method: 'DELETE' });
  if (!res) return;
  if (res.ok) { showToast('Fornecedor excluído!'); loadVendors(); }
  else { const d = await res.json(); showToast(d.error || 'Erro ao excluir', 'danger'); }
}
