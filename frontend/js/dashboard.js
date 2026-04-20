requireAuth();
updateNavbarEvent();

let events = [];

async function loadEvents() {
  const res = await apiFetch('/api/events');
  if (!res) return;
  events = await res.json();

  const selector = document.getElementById('event-selector');
  const savedId = localStorage.getItem('selectedEventId');
  selector.innerHTML = '<option value="">-- Selecione um evento --</option>';
  events.forEach(ev => {
    const opt = document.createElement('option');
    opt.value = ev.id;
    opt.textContent = `${ev.name} (${formatDate(ev.date)})`;
    if (String(ev.id) === String(savedId)) opt.selected = true;
    selector.appendChild(opt);
  });

  if (savedId) {
    loadDashboard(savedId);
  } else {
    document.getElementById('no-event-msg').classList.remove('d-none');
  }
}

document.getElementById('event-selector').addEventListener('change', (e) => {
  const id = e.target.value;
  if (!id) {
    localStorage.removeItem('selectedEventId');
    localStorage.removeItem('selectedEventName');
    document.getElementById('dashboard-content').classList.add('d-none');
    document.getElementById('no-event-msg').classList.remove('d-none');
    updateNavbarEvent();
    return;
  }
  const ev = events.find(e => String(e.id) === String(id));
  if (ev) {
    localStorage.setItem('selectedEventId', ev.id);
    localStorage.setItem('selectedEventName', ev.name);
    updateNavbarEvent();
    loadDashboard(ev.id);
  }
});

async function loadDashboard(eventId) {
  document.getElementById('no-event-msg').classList.add('d-none');
  document.getElementById('dashboard-content').classList.remove('d-none');

  const event = events.find(e => String(e.id) === String(eventId));
  if (event) {
    document.getElementById('ov-name').textContent = event.name;
    document.getElementById('ov-date').textContent = formatDate(event.date);
    document.getElementById('ov-location').textContent = event.location;
    document.getElementById('ov-description').textContent = event.description || '—';
    document.getElementById('ov-budget').textContent = formatCurrency(event.budget);
    const statusMap = { ativo: 'ativo', encerrado: 'encerrado' };
    document.getElementById('ov-status').innerHTML =
      `<span class="status-badge badge-${event.status}">${event.status}</span>`;
  }

  const [summRes, tasksRes, appsRes] = await Promise.all([
    apiFetch(`/api/payments/summary?event_id=${eventId}`),
    apiFetch(`/api/tasks?event_id=${eventId}`),
    apiFetch(`/api/appointments?event_id=${eventId}`),
  ]);

  if (summRes && summRes.ok) {
    const s = await summRes.json();
    document.getElementById('fin-paid').textContent = formatCurrency(s.totalPaid);
    document.getElementById('fin-pending').textContent = formatCurrency(s.totalPending);
    document.getElementById('fin-overdue').textContent = formatCurrency(s.totalOverdue);
    document.getElementById('fin-percent').textContent = s.usedPercent + '%';
    const pct = Math.min(parseFloat(s.usedPercent), 100);
    document.getElementById('budget-progress-bar').style.width = pct + '%';
    document.getElementById('budget-progress-label').textContent = s.usedPercent + '%';
  }

  if (tasksRes && tasksRes.ok) {
    const tasks = await tasksRes.json();
    const tbody = document.getElementById('recent-tasks');
    const recent = tasks.slice(0, 5);
    if (recent.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-3">Nenhuma tarefa</td></tr>';
    } else {
      tbody.innerHTML = recent.map(t =>
        `<tr>
          <td>${t.title}</td>
          <td><span class="status-badge badge-${t.status}">${t.status.replace('_', ' ')}</span></td>
          <td>${formatDate(t.due_date)}</td>
        </tr>`
      ).join('');
    }
  }

  if (appsRes && appsRes.ok) {
    const apps = await appsRes.json();
    const today = new Date().toISOString().split('T')[0];
    const upcoming = apps.filter(a => a.date >= today).slice(0, 5);
    const tbody = document.getElementById('upcoming-appointments');
    if (upcoming.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-3">Nenhum compromisso</td></tr>';
    } else {
      tbody.innerHTML = upcoming.map(a =>
        `<tr>
          <td>${a.title}</td>
          <td>${formatDate(a.date)}</td>
          <td>${a.time || '—'}</td>
        </tr>`
      ).join('');
    }
  }
}

loadEvents();
