if (localStorage.getItem('token')) {
  window.location.href = '/dashboard.html';
}

document.getElementById('show-register').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('login-section').classList.add('d-none');
  document.getElementById('register-section').classList.remove('d-none');
});

document.getElementById('show-login').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('register-section').classList.add('d-none');
  document.getElementById('login-section').classList.remove('d-none');
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.classList.add('d-none');
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Erro ao fazer login';
      errEl.classList.remove('d-none');
      return;
    }
    localStorage.setItem('token', data.token);
    window.location.href = '/dashboard.html';
  } catch (err) {
    errEl.textContent = 'Erro de conexão com o servidor';
    errEl.classList.remove('d-none');
  }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const errEl = document.getElementById('register-error');
  errEl.classList.add('d-none');
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Erro ao cadastrar';
      errEl.classList.remove('d-none');
      return;
    }
    localStorage.setItem('token', data.token);
    window.location.href = '/dashboard.html';
  } catch (err) {
    errEl.textContent = 'Erro de conexão com o servidor';
    errEl.classList.remove('d-none');
  }
});
