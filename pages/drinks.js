import { el, navigate, fetchJSON } from '../app.js';
import { icon } from '../assets/icons.js';

function drinkCard(d) {
  return `
    <div class="drink-card">
      <div class="drink-card-top">
        ${icon('drink', 'drink-icon')}
        <h3>${d.name}</h3>
      </div>
      <div class="drink-macros">
        <span>${icon('fire')} ${d.calories} سعرة</span>
        <span>${icon('protein')} ${d.protein}g بروتين</span>
        <span>${icon('coin')} ${d.cost}</span>
      </div>
      <div class="drink-time">${icon('clock')} <span>${d.bestTime}</span></div>
      <div class="drink-ingredients">
        <span class="ingredients-label">المكونات:</span>
        <ul>${d.ingredients.map((ing) => `<li>${ing}</li>`).join('')}</ul>
      </div>
    </div>
  `;
}

export async function renderDrinks(root) {
  const wrap = el(`
    <div class="page drinks-page">
      <header class="page-header">
        <button class="icon-btn" id="back-btn">${icon('chevronRight')}</button>
        <h1>المشروبات</h1>
        <span class="header-spacer"></span>
      </header>
      <div class="loading-hint">${icon('clock')} جارِ تحميل المشروبات...</div>
    </div>
  `);
  root.appendChild(wrap);
  wrap.querySelector('#back-btn').addEventListener('click', () => navigate('dashboard'));

  let economical, highCalorie;
  try {
    [economical, highCalorie] = await Promise.all([
      fetchJSON('./data/drinks/economical.json'),
      fetchJSON('./data/drinks/high-calorie.json'),
    ]);
  } catch (err) {
    wrap.querySelector('.loading-hint').textContent = 'تعذر تحميل قائمة المشروبات.';
    console.warn(err);
    return;
  }

  wrap.querySelector('.loading-hint').remove();

  const tabsSection = el(`
    <div class="drinks-tabs-wrap">
      <div class="tabs" id="drink-tabs">
        <button class="tab-btn active" data-tab="economical">اقتصادية (${economical.length})</button>
        <button class="tab-btn" data-tab="highCalorie">عالية السعرات (${highCalorie.length})</button>
      </div>
      <div class="drinks-grid" id="drinks-grid"></div>
    </div>
  `);
  wrap.appendChild(tabsSection);

  const grid = tabsSection.querySelector('#drinks-grid');
  const dataByTab = { economical, highCalorie };

  function renderTab(tab) {
    grid.innerHTML = dataByTab[tab].map(drinkCard).join('');
  }

  tabsSection.querySelector('#drink-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    tabsSection.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderTab(btn.dataset.tab);
  });

  renderTab('economical');
}
