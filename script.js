const auth = document.getElementById('auth');
const dashboard = document.getElementById('dashboard');
const paywall = document.getElementById('paywall');

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const addHabitBtn = document.getElementById('addHabitBtn');

let currentUser = null;

// LOGIN / CADASTRO
loginBtn.onclick = () => {
  const user = username.value.trim();
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value.trim();

  if (!user || !email || !pass) {
    alert('Preencha todos os campos.');
    return;
  }

  let users = JSON.parse(localStorage.getItem('users')) || {};

  // Se for um novo usuário, cria agora
  if (!users[user]) {
    users[user] = {
      email,
      pass,
      createdAt: new Date().toISOString(),
      habits: []
    };
  }

  currentUser = user;
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('session', user);

  loadApp();
};

logoutBtn.onclick = () => {
  localStorage.removeItem('session');
  location.reload();
};

// CARREGAMENTO DO APP
function loadApp() {
  auth.classList.add('hidden');
  dashboard.classList.remove('hidden');
  paywall.classList.add('hidden'); // garante que começa oculto

  checkTrial();
  renderHabits();
}

// TRIAL DE 7 DIAS (corrigido)
function checkTrial() {
  const users = JSON.parse(localStorage.getItem('users'));
  const userData = users[currentUser];

  if (!userData.createdAt) {
    userData.createdAt = new Date().toISOString();
    localStorage.setItem('users', JSON.stringify(users));
    return;
  }

  const created = new Date(userData.createdAt);
  const today = new Date();

  const diffDays = Math.floor(
    (today - created) / (1000 * 60 * 60 * 24)
  );

  // Só bloqueia após o 7º dia COMPLETO
  if (diffDays >= 7) {
    paywall.classList.remove('hidden');
  }
}

// HÁBITOS
addHabitBtn.onclick = () => {
  const input = document.getElementById('habitInput');
  if (!input.value.trim()) return;

  const users = JSON.parse(localStorage.getItem('users'));
  users[currentUser].habits.push({
    text: `${input.value} (versão mínima)`,
    done: false
  });

  localStorage.setItem('users', JSON.stringify(users));
  input.value = '';
  renderHabits();
};

function renderHabits() {
  const list = document.getElementById('habitList');
  list.innerHTML = '';

  const users = JSON.parse(localStorage.getItem('users'));
  users[currentUser].habits.forEach((habit, index) => {
    const li = document.createElement('li');
    li.className = habit.done ? 'done' : '';

    li.innerHTML = `
      <span>${habit.text}</span>
      <button aria-label="Marcar hábito">✓</button>
    `;

    li.querySelector('button').onclick = () => toggleHabit(index);
    list.appendChild(li);
  });
}

function toggleHabit(index) {
  const users = JSON.parse(localStorage.getItem('users'));
  users[currentUser].habits[index].done = !users[currentUser].habits[index].done;
  localStorage.setItem('users', JSON.stringify(users));
  renderHabits();
}

// AUTO LOGIN
const session = localStorage.getItem('session');
if (session) {
  currentUser = session;
  loadApp();
}