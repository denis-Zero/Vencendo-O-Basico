const auth = document.getElementById('auth');
const dashboard = document.getElementById('dashboard');
const paywall = document.getElementById('paywall');

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const addHabitBtn = document.getElementById('addHabitBtn');

let currentUser = null;
let isNewUser = false;

/* =========================
   LOGIN / CADASTRO
========================= */
loginBtn.onclick = () => {
  const user = username.value.trim();
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value.trim();

  if (!user || !email || !pass) {
    alert('Preencha todos os campos.');
    return;
  }

  let users = JSON.parse(localStorage.getItem('users')) || {};
  isNewUser = false;

  if (!users[user]) {
    users[user] = {
      email,
      pass,
      createdAt: new Date().toISOString(),
      habits: []
    };
    isNewUser = true; // 🔑 usuário acabou de nascer
  }

  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('session', user);
  currentUser = user;

  loadApp();
};

logoutBtn.onclick = () => {
  localStorage.removeItem('session');
  location.reload();
};

/* =========================
   LOAD APP
========================= */
function loadApp() {
  auth.classList.add('hidden');
  dashboard.classList.remove('hidden');
  paywall.classList.add('hidden'); // 🔒 SEMPRE começa oculto

  // ⚠️ usuário novo NÃO passa por trial
  if (!isNewUser) {
    checkTrial();
  }

  renderHabits();
}

/* =========================
   TRIAL 7 DIAS (BLINDADO)
========================= */
function checkTrial() {
  const users = JSON.parse(localStorage.getItem('users'));
  const userData = users[currentUser];

  // segurança absoluta
  if (!userData || !userData.createdAt) return;

  const created = new Date(userData.createdAt);
  const today = new Date();

  const diffDays = Math.floor(
    (today - created) / (1000 * 60 * 60 * 24)
  );

  if (diffDays >= 7) {
    paywall.classList.remove('hidden');
  }
}

/* =========================
   HÁBITOS
========================= */
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
  if (!users[currentUser]) return;

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
  users[currentUser].habits[index].done =
    !users[currentUser].habits[index].done;

  localStorage.setItem('users', JSON.stringify(users));
  renderHabits();
}

/* =========================
   AUTO LOGIN (VALIDADO)
========================= */
const session = localStorage.getItem('session');
const users = JSON.parse(localStorage.getItem('users'));

if (session && users && users[session]) {
  currentUser = session;
  isNewUser = false;
  loadApp();
} else {
  localStorage.removeItem('session'); // limpa sessão inválida
}
