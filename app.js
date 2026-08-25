// ============================================================
// CARGA MENTAL — app.js
// Requiere que firebase-config.js haya inicializado `firebase`
// con firebase.initializeApp({...}) ANTES de este script.
// ============================================================

const CATEGORIES = [
  { id: 'salud',    label: 'Salud',    color: 'var(--c-salud)',    keywords: ['doctor','dentista','remedio','pastilla','control','examen','vacuna','salud','cita medica','farmacia','hora medica','clinica'] },
  { id: 'viajes',   label: 'Viajes',   color: 'var(--c-viajes)',   keywords: ['viaje','vuelo','hotel','pasaje','reserva','maleta','vacaciones','itinerario'] },
  { id: 'compras',  label: 'Compras',  color: 'var(--c-compras)',  keywords: ['comprar','super','mercado','tienda','pedido','delivery','encargar'] },
  { id: 'deseos',   label: 'Lista de deseos', color: 'var(--c-deseos)', keywords: ['deseo','regalo','wishlist','antojo','capricho','quiero comprar','me gustaria tener'] },
  { id: 'eventos',  label: 'Eventos',  color: 'var(--c-eventos)',  keywords: ['cumpleanos','fiesta','celebracion','aniversario','matrimonio','evento','invitacion','reunion familiar','junta'] },
  { id: 'laboral',  label: 'Laboral',  color: 'var(--c-laboral)',  keywords: ['reunion de trabajo','reunion equipo','jefe','proyecto','informe','entrega','oficina','cliente','pega','sueldo','recordatorio de trabajo'] },
  { id: 'hogar',    label: 'Hogar',    color: 'var(--c-hogar)',    keywords: ['tramite','cedula','municipal','reparacion','arreglo','casa','hogar','mantencion','gasfiter','electricista','certificado','renovar'] },
  { id: 'finanzas', label: 'Finanzas', color: 'var(--c-finanzas)', keywords: ['pagar','pago','cuenta','tarjeta','banco','deuda','ahorro','presupuesto','boleta','factura','seguro','organizar plata','reembolso','reembolsar','isapre','fonasa','devolucion'] },
  { id: 'otros',    label: 'Nota mental', color: 'var(--c-otros)',  keywords: [] },
];

const catById = id => CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

const COMMON_CHORES = [
  'Planchar', 'Limpiar baño', 'Cambiar sábanas', 'Aspirar', 'Lavar loza',
  'Sacar la basura', 'Regar las plantas', 'Limpiar cocina', 'Lavar ropa', 'Ordenar living',
];

function suggestCategory(text) {
  const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let best = null, bestScore = 0;
  for (const cat of CATEGORIES) {
    let score = 0;
    for (const kw of cat.keywords) if (norm.includes(kw)) score++;
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return best ? best.id : 'otros';
}

// ---------- state ----------
let currentUser = null;
let googleAccessToken = null; // used for Calendar API calls
let familyCode = null;
let activeFilter = 'todas';
let unsubscribeItems = null;
let itemsCache = [];

const db = firebase.firestore();
const auth = firebase.auth();

// ---------- DOM ----------
const loginScreen = document.getElementById('loginScreen');
const familyScreen = document.getElementById('familyScreen');
const appScreen = document.getElementById('appScreen');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const familyForm = document.getElementById('familyForm');
const familyCodeInput = document.getElementById('familyCodeInput');
const familyTitle = document.getElementById('familyTitle');
const userBadge = document.getElementById('userBadge');
const signOutBtn = document.getElementById('signOutBtn');
const quickAddForm = document.getElementById('quickAddForm');
const quickAddInput = document.getElementById('quickAddInput');
const categorySelect = document.getElementById('categorySelect');
const dueDateInput = document.getElementById('dueDateInput');
const suggestHint = document.getElementById('suggestHint');
const categoryTabs = document.getElementById('categoryTabs');
const itemList = document.getElementById('itemList');
const emptyState = document.getElementById('emptyState');
const toastEl = document.getElementById('toast');
const choreChips = document.getElementById('choreChips');
const recurringCheckbox = document.getElementById('recurringCheckbox');
const calendarCheckbox = document.getElementById('calendarCheckbox');
const micBtn = document.getElementById('micBtn');
const recurringOptions = document.getElementById('recurringOptions');
const recurrenceInterval = document.getElementById('recurrenceInterval');
const assignedToInput = document.getElementById('assignedToInput');
const viewTabs = document.querySelectorAll('.view-tab');
const tasksView = document.getElementById('tasksView');
const menuView = document.getElementById('menuView');
const prevWeekBtn = document.getElementById('prevWeekBtn');
const nextWeekBtn = document.getElementById('nextWeekBtn');
const weekLabel = document.getElementById('weekLabel');
const menuGrid = document.getElementById('menuGrid');

function showScreen(name) {
  [loginScreen, familyScreen, appScreen].forEach(s => s.classList.add('hidden'));
  ({ login: loginScreen, family: familyScreen, app: appScreen }[name]).classList.remove('hidden');
}

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.add('hidden'), 2600);
}

// ---------- auth ----------
googleSignInBtn.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  // Scope adicional para poder crear eventos en Calendar
  provider.addScope('https://www.googleapis.com/auth/calendar.events');
  try {
    const result = await auth.signInWithPopup(provider);
    const credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);
    googleAccessToken = credential.accessToken;
    sessionStorage.setItem('gcalToken', googleAccessToken);
  } catch (err) {
    console.error(err);
    toast('No se pudo iniciar sesión: ' + err.message);
  }
});

signOutBtn.addEventListener('click', () => {
  if (unsubscribeItems) unsubscribeItems();
  auth.signOut();
  localStorage.removeItem('familyCode');
  sessionStorage.removeItem('gcalToken');
  familyCode = null;
  showScreen('login');
});

auth.onAuthStateChanged(user => {
  currentUser = user;
  if (!user) { showScreen('login'); return; }
  userBadge.textContent = user.displayName || user.email;
  googleAccessToken = sessionStorage.getItem('gcalToken');
  const savedFamily = localStorage.getItem('familyCode');
  if (savedFamily) {
    enterFamily(savedFamily);
  } else {
    showScreen('family');
  }
  requestNotificationPermission();
});

// ---------- family space ----------
familyForm.addEventListener('submit', e => {
  e.preventDefault();
  const code = familyCodeInput.value.trim().toLowerCase().replace(/\s+/g, '-');
  if (!code) return;
  enterFamily(code);
});

async function enterFamily(code) {
  familyCode = code;
  localStorage.setItem('familyCode', code);
  familyTitle.textContent = code;
  await db.collection('families').doc(code).set(
    { lastActive: firebase.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
  showScreen('app');
  listenToItems();
}

// ---------- categories UI ----------
function buildCategoryUI() {
  categorySelect.innerHTML = CATEGORIES.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
  categoryTabs.innerHTML = ['<button class="cat-tab active" data-cat="todas" style="background:var(--ink)">Todas</button>']
    .concat(CATEGORIES.map(c => `<button class="cat-tab" data-cat="${c.id}" style="border-color:${c.color}">${c.label}</button>`))
    .join('');
}
buildCategoryUI();

categoryTabs.addEventListener('click', e => {
  const btn = e.target.closest('.cat-tab');
  if (!btn) return;
  activeFilter = btn.dataset.cat;
  document.querySelectorAll('.cat-tab').forEach(b => {
    const isActive = b === btn;
    b.classList.toggle('active', isActive);
    if (isActive) {
      b.style.background = b.dataset.cat === 'todas' ? 'var(--ink)' : catById(b.dataset.cat).color;
    } else {
      b.style.background = 'var(--paper-raised)';
    }
  });
  renderItems();
});

// ---------- quick add + live category suggestion ----------
let userTouchedCategory = false;
categorySelect.addEventListener('change', () => {
  userTouchedCategory = true;
  toggleChoreChips();
});

function toggleChoreChips() {
  if (categorySelect.value === 'hogar') {
    choreChips.innerHTML = COMMON_CHORES.map(c => `<button type="button" class="chore-chip" data-chore="${c}">${c}</button>`).join('');
    choreChips.classList.remove('hidden');
  } else {
    choreChips.classList.add('hidden');
    choreChips.innerHTML = '';
  }
}

choreChips.addEventListener('click', e => {
  const chip = e.target.closest('.chore-chip');
  if (!chip) return;
  quickAddInput.value = chip.dataset.chore;
  recurringCheckbox.checked = true;
  recurringOptions.classList.remove('hidden');
  quickAddInput.focus();
});

recurringCheckbox.addEventListener('change', () => {
  recurringOptions.classList.toggle('hidden', !recurringCheckbox.checked);
});
quickAddInput.addEventListener('input', () => {
  if (userTouchedCategory) return;
  const text = quickAddInput.value;
  if (text.length < 3) { suggestHint.classList.add('hidden'); return; }
  const suggested = suggestCategory(text);
  categorySelect.value = suggested;
  toggleChoreChips();
  if (suggested !== 'otros') {
    suggestHint.textContent = `Sugerido: ${catById(suggested).label} — puedes cambiarlo si no calza.`;
    suggestHint.classList.remove('hidden');
  } else {
    suggestHint.classList.add('hidden');
  }
});

quickAddForm.addEventListener('submit', async e => {
  e.preventDefault();
  const text = quickAddInput.value.trim();
  if (!text || !familyCode) return;
  const category = categorySelect.value;
  const isRecurring = recurringCheckbox.checked;
  const dueDate = dueDateInput.value
    ? new Date(dueDateInput.value).toISOString()
    : (isRecurring ? new Date().toISOString() : null);

  const newItem = {
    text,
    category,
    dueDate,
    done: false,
    recurring: isRecurring,
    recurrenceDays: isRecurring ? Number(recurrenceInterval.value) : null,
    assignedTo: isRecurring ? (assignedToInput.value.trim() || null) : null,
    createdBy: currentUser.displayName || currentUser.email,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('families').doc(familyCode).collection('items').add(newItem);

  if (calendarCheckbox.checked && dueDate) {
    addToGoogleCalendar(newItem);
  } else if (calendarCheckbox.checked && !dueDate) {
    toast('Agrega una fecha para poder mandarlo a Calendar.');
  }

  quickAddInput.value = '';
  dueDateInput.value = '';
  userTouchedCategory = false;
  recurringCheckbox.checked = false;
  recurringOptions.classList.add('hidden');
  calendarCheckbox.checked = false;
  assignedToInput.value = '';
  suggestHint.classList.add('hidden');
  quickAddInput.focus();
});

// ---------- firestore live sync ----------
function listenToItems() {
  if (unsubscribeItems) unsubscribeItems();
  unsubscribeItems = db.collection('families').doc(familyCode).collection('items')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snap => {
      itemsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderItems();
      checkUpcomingReminders();
    }, err => {
      console.error(err);
      toast('Error de sincronización: ' + err.message);
    });
}

function renderItems() {
  const filtered = activeFilter === 'todas' ? itemsCache : itemsCache.filter(i => i.category === activeFilter);
  emptyState.classList.toggle('hidden', filtered.length > 0);
  itemList.innerHTML = filtered.map(item => {
    const cat = catById(item.category);
    const dueLabel = item.dueDate
      ? new Date(item.dueDate).toLocaleString('es-CL', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
      : null;
    return `
      <article class="item-card ${item.done ? 'done' : ''}" style="border-left-color:${cat.color}">
        <button class="item-check ${item.done ? 'checked' : ''}" data-id="${item.id}" aria-label="Marcar como hecho"></button>
        <div class="item-body">
          <p class="item-text">${escapeHtml(item.text)}</p>
          <div class="item-meta">
            <span class="item-tag" style="background:${cat.color}">${cat.label}</span>
            ${dueLabel ? `<span class="item-due">📅 ${dueLabel}</span>` : ''}
            ${item.recurring ? `<span class="item-badge-recurring">🔁 ${recurrenceLabel(item.recurrenceDays)}${item.assignedTo ? ' · ' + escapeHtml(item.assignedTo) : ''}</span>` : ''}
            <span class="item-author">— ${escapeHtml(item.createdBy || '')}</span>
          </div>
        </div>
        <div class="item-actions">
          ${item.dueDate ? `<button class="icon-btn cal-btn" data-id="${item.id}" title="Agregar a Google Calendar">📆</button>` : ''}
          <button class="icon-btn del-btn" data-id="${item.id}" title="Eliminar">✕</button>
        </div>
      </article>
    `;
  }).join('');
}

function recurrenceLabel(days) {
  if (days === 7) return 'cada semana';
  if (days === 14) return 'cada 2 semanas';
  if (days === 30) return 'cada mes';
  return `cada ${days} días`;
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

itemList.addEventListener('click', async e => {
  const id = e.target.dataset.id;
  if (!id) return;
  const ref = db.collection('families').doc(familyCode).collection('items').doc(id);

  if (e.target.classList.contains('item-check')) {
    const item = itemsCache.find(i => i.id === id);
    if ((item.category === 'compras' || item.category === 'deseos') && !item.recurring) {
      await ref.delete();
      toast(item.category === 'compras' ? 'Comprado ✓' : 'Cumplido ✓');
    } else if (item.recurring) {
      const base = item.dueDate ? new Date(item.dueDate) : new Date();
      const next = new Date(base.getTime() + item.recurrenceDays * 24 * 60 * 60000);
      await ref.update({
        done: false,
        dueDate: next.toISOString(),
        lastCompletedAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastCompletedBy: currentUser.displayName || currentUser.email,
      });
      toast(`Listo. Reprogramado para ${next.toLocaleDateString('es-CL', { day:'2-digit', month:'short' })}`);
    } else {
      await ref.update({ done: !item.done });
    }
  }
  if (e.target.classList.contains('del-btn')) {
    await ref.delete();
  }
  if (e.target.classList.contains('cal-btn')) {
    const item = itemsCache.find(i => i.id === id);
    addToGoogleCalendar(item);
  }
});

// ---------- Google Calendar ----------
async function addToGoogleCalendar(item) {
  if (!googleAccessToken) {
    toast('Necesitas volver a iniciar sesión para autorizar Calendar.');
    return;
  }
  const start = new Date(item.dueDate);
  const end = new Date(start.getTime() + 30 * 60000); // 30 min por defecto

  const event = {
    summary: item.text,
    description: `Creado desde Carga Mental — categoría: ${catById(item.category).label}`,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
  };

  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${googleAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      if (res.status === 401) {
        toast('Tu sesión de Calendar expiró. Cierra sesión y vuelve a entrar.');
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || res.statusText);
      }
      return;
    }
    toast('Agregado a Google Calendar ✓');
  } catch (err) {
    console.error(err);
    toast('No se pudo crear el evento: ' + err.message);
  }
}

// ---------- View switcher ----------
viewTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    viewTabs.forEach(t => t.classList.toggle('active', t === tab));
    const showMenu = tab.dataset.view === 'menu';
    tasksView.classList.toggle('hidden', showMenu);
    menuView.classList.toggle('hidden', !showMenu);
    if (showMenu && !menuUnsubscribe) listenToMenu();
  });
});

// ---------- Menú semanal ----------
const MEALS = [
  { id: 'desayuno', label: 'Desayuno' },
  { id: 'almuerzo', label: 'Almuerzo' },
  { id: 'cena', label: 'Cena' },
];
const DAYS = [
  { id: 'lun', label: 'Lun' }, { id: 'mar', label: 'Mar' }, { id: 'mie', label: 'Mié' },
  { id: 'jue', label: 'Jue' }, { id: 'vie', label: 'Vie' }, { id: 'sab', label: 'Sáb' }, { id: 'dom', label: 'Dom' },
];

let currentWeekMonday = getMonday(new Date());
let menuUnsubscribe = null;
let menuCache = {};
let menuSaveTimers = {};

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=dom
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function weekIdFor(monday) {
  return monday.toISOString().slice(0, 10); // YYYY-MM-DD del lunes
}
function weekLabelFor(monday) {
  const sunday = new Date(monday.getTime() + 6 * 86400000);
  const fmt = d => d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
  return `${fmt(monday)} — ${fmt(sunday)}`;
}

prevWeekBtn.addEventListener('click', () => {
  currentWeekMonday = new Date(currentWeekMonday.getTime() - 7 * 86400000);
  listenToMenu();
});
nextWeekBtn.addEventListener('click', () => {
  currentWeekMonday = new Date(currentWeekMonday.getTime() + 7 * 86400000);
  listenToMenu();
});

function listenToMenu() {
  if (menuUnsubscribe) menuUnsubscribe();
  weekLabel.textContent = weekLabelFor(currentWeekMonday);
  const weekId = weekIdFor(currentWeekMonday);
  const ref = db.collection('families').doc(familyCode).collection('menus').doc(weekId);
  menuUnsubscribe = ref.onSnapshot(snap => {
    menuCache = snap.exists ? snap.data() : {};
    renderMenuGrid(weekId);
  });
}

function renderMenuGrid(weekId) {
  let html = `<div class="menu-cell head"></div>`;
  DAYS.forEach(d => { html += `<div class="menu-cell head">${d.label}</div>`; });

  MEALS.forEach(meal => {
    html += `<div class="menu-cell meal-label">${meal.label}</div>`;
    DAYS.forEach(day => {
      const value = (menuCache[day.id] && menuCache[day.id][meal.id]) || '';
      html += `<div class="menu-cell"><textarea data-day="${day.id}" data-meal="${meal.id}" placeholder="—">${escapeHtml(value)}</textarea></div>`;
    });
  });
  menuGrid.innerHTML = html;

  menuGrid.querySelectorAll('textarea').forEach(ta => {
    ta.addEventListener('input', () => {
      const key = ta.dataset.day + '.' + ta.dataset.meal;
      clearTimeout(menuSaveTimers[key]);
      menuSaveTimers[key] = setTimeout(() => saveMenuCell(weekId, ta.dataset.day, ta.dataset.meal, ta.value), 600);
    });
  });
}

async function saveMenuCell(weekId, day, meal, value) {
  const ref = db.collection('families').doc(familyCode).collection('menus').doc(weekId);
  await ref.set({ [day]: { [meal]: value } }, { merge: true });
}

// ---------- Dictado por voz ----------
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognitionAPI) {
  const recognition = new SpeechRecognitionAPI();
  recognition.lang = 'es-CL';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let listening = false;

  micBtn.addEventListener('click', () => {
    if (listening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
    } catch (err) {
      console.warn('No se pudo iniciar el micrófono:', err);
      toast('El micrófono no está disponible en este navegador.');
    }
  });

  recognition.addEventListener('start', () => {
    listening = true;
    micBtn.classList.add('listening');
  });

  recognition.addEventListener('end', () => {
    listening = false;
    micBtn.classList.remove('listening');
  });

  recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    quickAddInput.value = quickAddInput.value ? quickAddInput.value + ' ' + transcript : transcript;
    quickAddInput.dispatchEvent(new Event('input')); // dispara la autosugerencia de categoría
  });

  recognition.addEventListener('error', (event) => {
    listening = false;
    micBtn.classList.remove('listening');
    if (event.error === 'not-allowed') {
      toast('Necesitas dar permiso de micrófono para dictar.');
    } else if (event.error !== 'aborted') {
      toast('No se pudo reconocer el audio, intenta de nuevo.');
    }
  });
} else {
  // El navegador no soporta dictado por voz — ocultamos el botón en vez de mostrar algo roto
  micBtn.style.display = 'none';
}

// ---------- Notificaciones locales (solo con la app abierta) ----------
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

const notifiedKeys = new Set();
function checkUpcomingReminders() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = Date.now();
  itemsCache.forEach(item => {
    if (item.done || !item.dueDate) return;
    const key = item.id + '|' + item.dueDate;
    if (notifiedKeys.has(key)) return;
    const due = new Date(item.dueDate).getTime();
    const diff = due - now;
    // avisa si vence dentro de los próximos 60 minutos
    if (diff > 0 && diff <= 60 * 60000) {
      notifiedKeys.add(key);
      new Notification('Carga Mental — vence pronto', {
        body: item.text,
        tag: item.id,
      });
    }
  });
}
setInterval(checkUpcomingReminders, 5 * 60000); // revisa cada 5 min mientras la app está abierta

// ---------- Service worker (PWA / instalable) ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW no registrado:', err));
  });
}
