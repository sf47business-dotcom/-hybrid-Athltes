import { icon } from './assets/icons.js';
import { renderNav } from './components/nav.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderNutrition } from './pages/nutrition.js';
import { renderDrinks } from './pages/drinks.js';
import { renderRunning } from './pages/running.js';
import { renderStrength } from './pages/strength.js';
import { renderProgress } from './pages/progress.js';
import { renderShopping } from './pages/shopping.js';
import { renderSettings } from './pages/settings.js';
import { renderOnboarding } from './pages/onboarding.js';

/* ==========================================================================
   المخزن المركزي للحالة (Store) — كل البيانات تُحفظ في LocalStorage
   ========================================================================== */

const STORAGE_KEY = 'hybridBlueprint.v1';

const DEFAULT_STATE = {
  profile: {
    name: '',
    onboarded: false,
    currentWeight: 78,
    goalWeight: 72,
    height: 175,
    gender: 'male',
  },
  today: {
    date: todayISO(),
    calories: { current: 0, goal: 2400 },
    protein: { current: 0, goal: 160 },
    water: { current: 0, goal: 8 }, // بالأكواب
    tasks: [
      { id: 't1', text: 'شرب 2 لتر ماء', done: false },
      { id: 't2', text: 'وجبة بروتين بعد التمرين', done: false },
      { id: 't3', text: '10 دقائق تمدد', done: false },
    ],
  },
  weeklyProgress: buildEmptyWeek(),
  meals: {}, // { 'YYYY-MM-DD': { breakfast:[], lunch:[], dinner:[], snacks:[], preworkout:[], postworkout:[] } }
  nutritionPlan: { currentDay: 1 },
  mealChecks: {}, // { 'date:day:category:index': true }
  runningProgress: {
    beginner: { currentWeek: 1, completedDays: [] },
    '5k': { currentWeek: 1, completedDays: [] },
    '10k': { currentWeek: 1, completedDays: [] },
    'half-marathon': { currentWeek: 1, completedDays: [] },
  },
  strengthLog: {}, // { dayNumber: { history: [] } }
  progressHistory: {
    weights: [],
    runDistances: [],
    personalRecords: [],
  },
  shoppingList: [
    { id: 's1', text: 'صدر دجاج', done: false, qty: '1 كغ' },
    { id: 's2', text: 'أرز بني', done: false, qty: '1 كغ' },
    { id: 's3', text: 'بيض', done: false, qty: '30 حبة' },
  ],
  settings: {
    darkMode: true,
    units: 'metric',
    notifications: true,
  },
};

function todayISO() {
  // نستخدم التاريخ المحلي للمستخدم بدل UTC لتفادي تغيّر "اليوم" قبل منتصف الليل المحلي بساعة أو أكثر
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildEmptyWeek() {
  const days = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  return days.map((d) => ({ day: d, caloriesGoalMet: false, workoutDone: false }));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    // دمج آمن مع الحالة الافتراضية لضمان توفر كل الحقول بعد التحديثات
    return deepMerge(structuredClone(DEFAULT_STATE), parsed);
  } catch (e) {
    console.warn('تعذر تحميل البيانات المحفوظة، سيتم استخدام القيم الافتراضية', e);
    return structuredClone(DEFAULT_STATE);
  }
}

function deepMerge(target, source) {
  if (typeof source !== 'object' || source === null) return target;
  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object'
    ) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export const state = loadState();

document.documentElement.classList.toggle('light-mode', !state.settings.darkMode);

export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// إعادة ضبط اليوم إذا تغيّر التاريخ (تسجيل تلقائي لليوم السابق ضمن التقدم الأسبوعي)
(function rolloverDay() {
  const iso = todayISO();
  if (state.today.date !== iso) {
    state.today.date = iso;
    state.today.calories.current = 0;
    state.today.protein.current = 0;
    state.today.water.current = 0;
    state.today.tasks = state.today.tasks.map((t) => ({ ...t, done: false }));
    saveState();
  }
})();

/* ==========================================================================
   الموجّه (Router) — نظام تنقل بسيط قائم على الـ hash
   ========================================================================== */

const routes = {
  dashboard: renderDashboard,
  nutrition: renderNutrition,
  drinks: renderDrinks,
  running: renderRunning,
  strength: renderStrength,
  progress: renderProgress,
  shopping: renderShopping,
  settings: renderSettings,
};

const appEl = document.getElementById('app');
const navEl = document.getElementById('bottom-nav');

export function navigate(routeName, params = {}) {
  window.location.hash = params && Object.keys(params).length
    ? `${routeName}?${new URLSearchParams(params).toString()}`
    : routeName;
}

function parseHash() {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  const [route, query] = hash.split('?');
  const params = Object.fromEntries(new URLSearchParams(query || ''));
  return { route: routes[route] ? route : 'dashboard', params };
}

function render() {
  if (!state.profile.onboarded) {
    navEl.classList.add('hidden');
    appEl.innerHTML = '';
    renderOnboarding(appEl, { onDone: () => { render(); } });
    return;
  }
  navEl.classList.remove('hidden');

  const { route, params } = parseHash();
  appEl.classList.remove('page-enter');
  void appEl.offsetWidth; // إعادة تشغيل الرسم لتفعيل الانتقال الحركي
  appEl.classList.add('page-enter');

  appEl.innerHTML = '';
  routes[route](appEl, params);
  renderNav(navEl, route);
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
  render();
  registerServiceWorker();
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch((err) => {
      console.warn('فشل تسجيل service worker', err);
    });
  }
}

/* ==========================================================================
   أدوات مساعدة عامة (Utils) تُستخدم عبر الصفحات
   ========================================================================== */

export function el(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function formatNumber(n) {
  return new Intl.NumberFormat('ar-DZ').format(n);
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const jsonCache = new Map();

/**
 * يجلب ملف JSON محليًا (من مجلد data/) ويخزّنه في الذاكرة لتفادي إعادة الجلب.
 * يعمل بدون إنترنت لأن الملفات محلية ويقوم الـ service worker بتخزينها مسبقًا.
 */
export async function fetchJSON(path) {
  if (jsonCache.has(path)) return jsonCache.get(path);
  const res = await fetch(path);
  if (!res.ok) throw new Error(`تعذر تحميل ${path}`);
  const data = await res.json();
  jsonCache.set(path, data);
  return data;
}

export { icon };
