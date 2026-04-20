requireAuth();
updateNavbarEvent();

const eventId = localStorage.getItem('selectedEventId');
let paymentModal;
let vendors = [];

document.addEventListener('DOMContentLoaded', () => {
  paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
  if (!requireEvent()) return;
  loadAll();
});

async function loadAll() {
  await loadVendors();
  await loadPayments();
  await loadSummary();
}

async function loadVendors() {
  const res = await apiFetch(`/api/vendors?event_id=${eventId}`);
  if (!res || !res.ok) return;
  vendors = await res.json();
}

async function loadSummary() {
  const res = await apiFetch(`/api/payments/summary?event_id=${eventId}`);
  if (!res || !res.ok) return;
  const s = await res.json();
  document.getElementById('sum-paid').textContent = formatCurrency(s.totalPaid);
  document.getElementById('sum-pending').textContent = formatCurrency(s.totalPending);
  document.getElementById('sum-overdue').textContent = formatCurrency(s.totalOverdue);
  document.getElementById('sum-percent').textContent = s.usedPercent + '%';
}

async function loadPayments() {
  const res = await apiFetch(`/api/payments?event_id=${eventId}`);
  if (!res) return;
  const payments = await res.json();
  const tbody = document.getElementById('payments-table');
  if (payments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Nenhum pagamento registrado.</td></tr>';
    return;
  }
  tbody.innerHTML = payments.map(p => `
    <tr>
      <td class="fw-semibold">${p.description}</td>
      <td>${p.vendor_name || '—'}</td>
      <td>${formatCurrency(p.amount)}</td>
      <td>${formatDate(p.due_date)}</td>
      <td>${formatDate(p.paid_date)}</td>
      <td><span class="status-badge badge-${p.status}">${p.status}</span></td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-secondary" onclick="openEditModal(${p.id})"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="deletePayment(${p.id})"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function populateVendorSelect(selectedId) {
  const sel = document.getElementById('payment-vendor_id');
  sel.innerHTML = '<option value="">Sem fornecedor</option>';
  vendors.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = `${v.name} (${v.category})`;
    if (String(v.id) === String(selectedId)) opt.selected = true;
    sel.appendChild(opt);
  });
}

function openCreateModal() {
  document.getElementById('paymentModalTitle').textContent = 'Registrar Pagamento';
  document.getElementById('payment-form').reset();
  document.getElementById('payment-id').value = '';
  populateVendorSelect('');
}

async function openEditModal(id) {
  const res = await apiFetch(`/api/payments/${id}`);
  if (!res || !res.ok) { showToast('Erro ao carregar pagamento', 'danger'); return; }
  const p = await res.json();
  document.getElementById('paymentModalTitle').textContent = 'Editar Pagamento';
  document.getElementById('payment-id').value = p.id;
  document.getElementById('payment-description').value = p.description;
  document.getElementById('payment-amount').value = p.amount;
  document.getElementById('payment-status').value = p.status;
  document.getElementById('payment-due_date').value = p.due_date;
  document.getElementById('payment-paid_date').value = p.paid_date || '';
  populateVendorSelect(p.vendor_id);
  paymentModal.show();
}

async function savePayment() {
  const id = document.getElementById('payment-id').value;
  const vendorVal = document.getElementById('payment-vendor_id').value;
  const paidDateVal = document.getElementById('payment-paid_date').value;
  const body = {
    description: document.getElementById('payment-description').value.trim(),
    amount: parseFloat(document.getElementById('payment-amount').value) || 0,
    status: document.getElementById('payment-status').value,
    due_date: document.getElementById('payment-due_date').value,
    paid_date: paidDateVal || null,
    vendor_id: vendorVal ? parseInt(vendorVal) : null,
    event_id: eventId,
  };
  if (!body.description || !body.due_date) { showToast('Preencha os campos obrigatórios', 'warning'); return; }
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/payments/${id}` : '/api/payments';
  const res = await apiFetch(url, { method, body: JSON.stringify(body) });
  if (!res) return;
  const data = await res.json();
  if (!res.ok) { showToast(data.error || 'Erro ao salvar', 'danger'); return; }
  showToast(id ? 'Pagamento atualizado!' : 'Pagamento registrado!');
  paymentModal.hide();
  loadAll();
}

async function deletePayment(id) {
  if (!confirm('Excluir este pagamento?')) return;
  const res = await apiFetch(`/api/payments/${id}`, { method: 'DELETE' });
  if (!res) return;
  if (res.ok) { showToast('Pagamento excluído!'); loadAll(); }
  else { const d = await res.json(); showToast(d.error || 'Erro ao excluir', 'danger'); }
}
