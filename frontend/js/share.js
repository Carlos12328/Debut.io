requireAuth();
updateNavbarEvent();

const eventId = localStorage.getItem('selectedEventId');
let shareData = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!requireEvent()) return;
  loadShareData();
});

async function loadShareData() {
  const res = await apiFetch(`/api/share/${eventId}`);
  if (!res || !res.ok) {
    document.getElementById('share-formatted').textContent = 'Erro ao carregar dados do evento.';
    return;
  }
  shareData = await res.json();
  renderFormatted(shareData);
  document.getElementById('share-json').textContent = JSON.stringify(shareData, null, 2);
}

function renderFormatted(data) {
  const { event, vendors, payments, tasks, appointments } = data;

  let text = '';
  text += `╔══════════════════════════════════════════════╗\n`;
  text += `║          🎀 DEBUT.IO — RESUMO DO EVENTO 🎀           ║\n`;
  text += `╚══════════════════════════════════════════════╝\n\n`;

  text += `📅 EVENTO\n`;
  text += `  Nome:     ${event.name}\n`;
  text += `  Data:     ${formatDate(event.date)}\n`;
  text += `  Local:    ${event.location}\n`;
  text += `  Status:   ${event.status.toUpperCase()}\n`;
  text += `  Orçamento: ${formatCurrency(event.budget)}\n`;
  if (event.description) text += `  Descrição: ${event.description}\n`;
  text += '\n';

  text += `👗 FORNECEDORES (${vendors.length})\n`;
  if (vendors.length === 0) {
    text += '  Nenhum fornecedor cadastrado.\n';
  } else {
    vendors.forEach(v => {
      text += `  • ${v.name} [${v.category}]`;
      if (v.phone) text += ` — Tel: ${v.phone}`;
      if (v.email) text += ` — Email: ${v.email}`;
      text += '\n';
    });
  }
  text += '\n';

  text += `💰 FINANCEIRO\n`;
  text += `  Total Pago:     ${formatCurrency(payments.summary.totalPaid)}\n`;
  text += `  Total Pendente: ${formatCurrency(payments.summary.totalPending)}\n`;
  text += `  Total Atrasado: ${formatCurrency(payments.summary.totalOverdue)}\n\n`;

  text += `  Pagamentos (${payments.list.length}):\n`;
  if (payments.list.length === 0) {
    text += '  Nenhum pagamento registrado.\n';
  } else {
    payments.list.forEach(p => {
      text += `  • ${p.description}: ${formatCurrency(p.amount)} — ${p.status.toUpperCase()} — Venc: ${formatDate(p.due_date)}\n`;
    });
  }
  text += '\n';

  text += `✅ TAREFAS\n`;
  text += `  Pendente: ${tasks.summary.pendente} | Em Andamento: ${tasks.summary.em_andamento} | Concluída: ${tasks.summary.concluida}\n`;
  if (tasks.list.length > 0) {
    tasks.list.forEach(t => {
      const statusIcon = t.status === 'concluida' ? '✅' : t.status === 'em_andamento' ? '🔄' : '⏳';
      text += `  ${statusIcon} ${t.title}`;
      if (t.due_date) text += ` — Prazo: ${formatDate(t.due_date)}`;
      text += '\n';
    });
  }
  text += '\n';

  text += `📆 COMPROMISSOS (${appointments.length})\n`;
  if (appointments.length === 0) {
    text += '  Nenhum compromisso agendado.\n';
  } else {
    appointments.forEach(a => {
      text += `  • ${a.title} — ${formatDate(a.date)}`;
      if (a.time) text += ` às ${a.time}`;
      if (a.location) text += ` — ${a.location}`;
      text += '\n';
    });
  }
  text += '\n';
  text += `Gerado por Debut.io em ${new Date().toLocaleString('pt-BR')}\n`;

  document.getElementById('share-formatted').textContent = text;
}

async function copyToClipboard() {
  const text = document.getElementById('share-formatted').textContent;
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copiado para a área de transferência!');
  } catch {
    showToast('Não foi possível copiar automaticamente. Selecione o texto manualmente e pressione Ctrl+C.', 'warning');
  }
}
