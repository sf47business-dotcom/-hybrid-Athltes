import { state, saveState, el, navigate, fetchJSON, clamp } from '../app.js';
import { icon } from '../assets/icons.js';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'الفطور', icon: 'nutrition' },
  { key: 'lunch', label: 'الغداء', icon: 'nutrition' },
  { key: 'dinner', label: 'العشاء', icon: 'nutrition' },
  { key: 'snacks', label: 'وجبات خفيفة', icon: 'nutrition' },
  { key: 'preworkout', label: 'قبل التمرين', icon: 'bolt' },
  { key: 'postworkout', label: 'بعد التمرين', icon: 'bolt' },
];

export async function renderNutrition(root) {
  const wrap = el(`
    <div class="page nutrition-page">
      <header class="page-header">
        <button class="icon-btn" id="back-btn">${icon('chevronRight')}</button>
        <h1>خطة التغذية</h1>
        <span class="header-spacer"></span>
      </header>
      <div class="loading-hint">${icon('clock')} جارِ تحميل الخطة...</div>
    </div>
  `);
  root.appendChild(wrap);
  wrap.querySelector('#back-btn').addEventListener('click', () => navigate('dashboard'));

  let plan, shoppingData;
  try {
    [plan, shoppingData] = await Promise.all([
      fetchJSON('./data/nutrition/meal-plan-30day.json'),
      fetchJSON('./data/nutrition/shopping-list.json'),
    ]);
  } catch (err) {
    wrap.querySelector('.loading-hint').textContent = 'تعذر تحميل بيانات الخطة. تأكد من الاتصال أو أعد المحاولة.';
    console.warn(err);
    return;
  }

  renderPlanUI(wrap, plan, shoppingData);
}

function renderPlanUI(wrap, plan, shoppingData) {
  const hint = wrap.querySelector('.loading-hint');
  if (hint) hint.remove();

  const totalDays = plan.days.length;
  const clampDay = () => {
    state.nutritionPlan.currentDay = clamp(state.nutritionPlan.currentDay, 1, totalDays);
  };
  clampDay();

  const body = el(`<div class="nutrition-body"></div>`);
  wrap.appendChild(body);

  function renderDay() {
    const dayData = plan.days.find((d) => d.day === state.nutritionPlan.currentDay);
    const dateKey = state.today.date;

    body.innerHTML = `
      <section class="card day-nav-card">
        <div class="day-nav">
          <button class="icon-btn" id="prev-day" aria-label="اليوم السابق">${icon('chevronRight')}</button>
          <div class="day-nav-title">
            <span>اليوم ${dayData.day} من ${totalDays}</span>
            <span class="card-subtitle">${dayData.totalCalories} سعرة • ${dayData.totalProtein}g بروتين مخطَّط</span>
          </div>
          <button class="icon-btn" id="next-day" aria-label="اليوم التالي">${icon('chevronLeft')}</button>
        </div>
      </section>

      <div class="totals-bar card">
        <span>${icon('fire')} <span id="totals-cal">${state.today.calories.current}</span> / ${state.today.calories.goal} سعرة</span>
        <span>${icon('protein')} <span id="totals-pro">${state.today.protein.current}</span> / ${state.today.protein.goal}g بروتين</span>
      </div>

      <div class="meal-sections" id="meal-sections"></div>

      <section class="card shopping-preview">
        <div class="card-header">
          <h3 class="card-title">${icon('shopping')} قائمة تسوق مقترحة</h3>
          <button class="btn btn-ghost btn-sm" id="view-shopping-btn">فتح القائمة</button>
        </div>
        <p class="empty-hint">${shoppingData.categories.length} فئات • ${shoppingData.categories.reduce((n, c) => n + c.items.length, 0)} عنصر جاهزة للإضافة</p>
      </section>
    `;

    const mealSections = body.querySelector('#meal-sections');
    MEAL_TYPES.forEach((m) => {
      const items = dayData[m.key] || [];
      const section = el(`
        <section class="card meal-section">
          <div class="card-header">
            <h3 class="card-title">${icon(m.icon)} ${m.label}</h3>
          </div>
          <ul class="meal-items">
            ${items.length === 0 ? `<li class="empty-hint">لا توجد عناصر لهذا اليوم</li>` : ''}
            ${items.map((item, idx) => {
              const key = `${dateKey}:${dayData.day}:${m.key}:${idx}`;
              const eaten = !!state.mealChecks[key];
              return `
                <li class="meal-item ${eaten ? 'eaten' : ''}" data-key="${key}" data-cal="${item.calories}" data-pro="${item.protein}">
                  <button class="task-check meal-check">${eaten ? icon('check') : ''}</button>
                  <div class="meal-item-info">
                    <span class="meal-item-name">${item.name}</span>
                    <span class="meal-item-macros">${item.calories} سعرة • ${item.protein}g بروتين</span>
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
        </section>
      `);
      mealSections.appendChild(section);
    });

    body.querySelector('#prev-day').addEventListener('click', () => {
      state.nutritionPlan.currentDay = clamp(state.nutritionPlan.currentDay - 1, 1, totalDays);
      saveState();
      renderDay();
    });
    body.querySelector('#next-day').addEventListener('click', () => {
      state.nutritionPlan.currentDay = clamp(state.nutritionPlan.currentDay + 1, 1, totalDays);
      saveState();
      renderDay();
    });

    mealSections.addEventListener('click', (e) => {
      const li = e.target.closest('.meal-item');
      if (!li) return;
      const key = li.dataset.key;
      const cal = Number(li.dataset.cal);
      const pro = Number(li.dataset.pro);
      const wasEaten = !!state.mealChecks[key];
      state.mealChecks[key] = !wasEaten;

      if (!wasEaten) {
        state.today.calories.current += cal;
        state.today.protein.current += pro;
      } else {
        state.today.calories.current = Math.max(0, state.today.calories.current - cal);
        state.today.protein.current = Math.max(0, state.today.protein.current - pro);
      }
      saveState();

      li.classList.toggle('eaten', !wasEaten);
      li.querySelector('.meal-check').innerHTML = !wasEaten ? icon('check') : '';
      body.querySelector('#totals-cal').textContent = state.today.calories.current;
      body.querySelector('#totals-pro').textContent = state.today.protein.current;
    });

    body.querySelector('#view-shopping-btn').addEventListener('click', () => {
      openShoppingSheet(shoppingData);
    });
  }

  renderDay();
}

function openShoppingSheet(shoppingData) {
  import('../components/modal.js').then(({ openModal, closeModal }) => {
    openModal({
      title: 'قائمة التسوق المقترحة',
      bodyHTML: `
        <div class="shopping-suggestions">
          ${shoppingData.categories.map((cat, ci) => `
            <div class="suggestion-category">
              <div class="suggestion-cat-header">
                <h4>${cat.category}</h4>
                <button class="btn btn-ghost btn-sm" data-add-all="${ci}">إضافة الكل</button>
              </div>
              <ul class="suggestion-items">
                ${cat.items.map((it, ii) => `
                  <li>
                    <span>${it.name} <span class="shopping-qty">${it.qty}</span></span>
                    <button class="icon-btn" data-add-item="${ci}:${ii}">${icon('plus')}</button>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      `,
      onMount: (overlay) => {
        overlay.querySelectorAll('[data-add-item]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const [ci, ii] = btn.dataset.addItem.split(':').map(Number);
            const item = shoppingData.categories[ci].items[ii];
            addToShoppingList(item);
            btn.replaceWith(el(`<span class="added-check">${icon('check')}</span>`));
          });
        });
        overlay.querySelectorAll('[data-add-all]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const ci = Number(btn.dataset.addAll);
            shoppingData.categories[ci].items.forEach(addToShoppingList);
            btn.textContent = 'تمت الإضافة ✓';
            btn.disabled = true;
          });
        });
      },
    });
  });
}

function addToShoppingList(item) {
  const exists = state.shoppingList.some((x) => x.text === item.name);
  if (exists) return;
  state.shoppingList.push({
    id: `shop-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    text: item.name,
    done: false,
    qty: item.qty || '',
  });
  saveState();
}
