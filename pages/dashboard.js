import { state, saveState, el, clamp, formatNumber, navigate } from '../app.js';
import { icon } from '../assets/icons.js';
import { progressRing, progressBar, updateProgressRing, updateProgressBar } from '../components/progressbar.js';
import { card } from '../components/card.js';
import { openModal, closeModal } from '../components/modal.js';

export function renderDashboard(root) {
  const p = state.profile;
  const t = state.today;

  const weightLeft = Math.abs(p.currentWeight - p.goalWeight).toFixed(1);
  const startWeight = state.progressHistory.weights[0]?.value ?? p.currentWeight;
  const totalToLose = Math.abs(startWeight - p.goalWeight) || 1;
  const doneSoFar = Math.abs(startWeight - p.currentWeight);
  const weightPct = clamp(Math.round((doneSoFar / totalToLose) * 100), 0, 100);
  const todayIndex = new Date().getDay();
  const doneTasks = t.tasks.filter((x) => x.done).length;

  const tasksListHTML = `
    <ul class="task-list" id="task-list">
      ${t.tasks.map((task) => `
        <li class="task-item ${task.done ? 'done' : ''}" data-id="${task.id}">
          <button class="task-check" aria-label="إتمام المهمة">${task.done ? icon('check') : ''}</button>
          <span>${task.text}</span>
        </li>
      `).join('')}
    </ul>
  `;

  const weekGridHTML = `
    <div class="week-grid">
      ${state.weeklyProgress.map((d, i) => `
        <div class="week-day ${d.workoutDone ? 'active' : ''} ${i === todayIndex ? 'is-today' : ''}">
          <span class="week-day-dot"></span>
          <span class="week-day-label">${d.day}</span>
        </div>
      `).join('')}
    </div>
  `;

  const waterCupsHTML = `
    <div class="water-cups" id="water-cups">
      ${Array.from({ length: t.water.goal }).map((_, i) => `
        <button class="water-cup ${i < t.water.current ? 'filled' : ''}" data-index="${i + 1}" aria-label="كوب ${i + 1}">${icon('water')}</button>
      `).join('')}
    </div>
  `;

  const wrap = el(`
    <div class="page dashboard">
      <header class="page-header">
        <div>
          <p class="greeting">أهلاً، ${p.name || 'بطل'} 👋</p>
          <h1>لوحة اليوم</h1>
        </div>
        <button class="icon-btn" id="more-btn" aria-label="الإعدادات">${icon('settings')}</button>
      </header>

      <section class="weight-card">
        <div class="weight-info">
          <span class="weight-label">الوزن الحالي</span>
          <span class="weight-value" id="weight-value">${p.currentWeight} <small>كغ</small></span>
          <div class="weight-goal-row" id="weight-goal-row">
            ${icon('scale', 'muted-icon')}
            <span>الهدف: ${p.goalWeight} كغ &nbsp;•&nbsp; متبقي ${weightLeft} كغ</span>
          </div>
          <div id="weight-progress">${progressBar({ value: weightPct, max: 100, color: 'primary', showText: false })}</div>
        </div>
        <button class="btn btn-ghost btn-sm" id="log-weight-btn">تحديث الوزن</button>
      </section>

      <section class="rings-row">
        <div class="ring-card" id="calories-ring-card">
          ${progressRing({ value: t.calories.current, max: t.calories.goal, color: 'accent', centerLabel: `${formatNumber(t.calories.current)}`, label: 'سعرة' })}
          <span class="ring-caption">${icon('fire')} من ${formatNumber(t.calories.goal)}</span>
        </div>
        <div class="ring-card" id="protein-ring-card">
          ${progressRing({ value: t.protein.current, max: t.protein.goal, color: 'secondary', centerLabel: `${t.protein.current}g`, label: 'بروتين' })}
          <span class="ring-caption">${icon('protein')} من ${t.protein.goal}g</span>
        </div>
        <div class="ring-card" id="water-ring-card">
          ${progressRing({ value: t.water.current, max: t.water.goal, color: 'primary', centerLabel: `${t.water.current}/${t.water.goal}`, label: 'ماء' })}
          <span class="ring-caption">${icon('water')} أكواب</span>
        </div>
      </section>

      <section id="water-section">
        ${card({
          className: 'water-tracker',
          title: `${icon('water')} متابعة الماء`,
          subtitle: `<span id="water-count">${t.water.current} / ${t.water.goal}</span> أكواب`,
          content: waterCupsHTML,
        })}
      </section>

      <section id="tasks-section">
        ${card({
          className: 'tasks-card',
          title: 'مهام اليوم',
          subtitle: `<span id="tasks-count">${doneTasks}/${t.tasks.length}</span>`,
          content: tasksListHTML,
        })}
      </section>

      <section id="week-section">
        ${card({
          className: 'week-card',
          title: 'التقدم الأسبوعي',
          content: weekGridHTML,
        })}
      </section>

      <section class="quick-links">
        <button class="quick-link" data-route="drinks">${icon('drink')}<span>المشروبات</span></button>
        <button class="quick-link" data-route="shopping">${icon('shopping')}<span>التسوق</span></button>
        <button class="quick-link" data-route="settings">${icon('settings')}<span>الإعدادات</span></button>
      </section>
    </div>
  `);

  root.appendChild(wrap);

  /* ------------------------------------------------------------------
     تفويض الأحداث (Event Delegation) بدل ربط مستمع لكل عنصر على حدة،
     وتحديث الواجهة مباشرة دون إعادة رسم الصفحة كاملة عند كل نقرة.
     ------------------------------------------------------------------ */

  wrap.querySelector('#water-cups').addEventListener('click', (e) => {
    const btn = e.target.closest('.water-cup');
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    t.water.current = t.water.current === idx ? idx - 1 : idx;
    saveState();

    wrap.querySelectorAll('.water-cup').forEach((cup, i) => {
      cup.classList.toggle('filled', i < t.water.current);
    });
    wrap.querySelector('#water-count').textContent = `${t.water.current} / ${t.water.goal}`;
    updateProgressRing(wrap.querySelector('#water-ring-card .ring-wrap'), t.water.current, t.water.goal, `${t.water.current}/${t.water.goal}`);
  });

  wrap.querySelector('#task-list').addEventListener('click', (e) => {
    const item = e.target.closest('.task-item');
    if (!item) return;
    const task = t.tasks.find((x) => x.id === item.dataset.id);
    task.done = !task.done;
    saveState();

    item.classList.toggle('done', task.done);
    item.querySelector('.task-check').innerHTML = task.done ? icon('check') : '';
    wrap.querySelector('#tasks-count').textContent = `${t.tasks.filter((x) => x.done).length}/${t.tasks.length}`;
  });

  wrap.querySelectorAll('[data-route]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });

  wrap.querySelector('#more-btn').addEventListener('click', () => navigate('settings'));

  wrap.querySelector('#log-weight-btn').addEventListener('click', () => {
    openModal({
      title: 'تحديث الوزن',
      bodyHTML: `
        <form id="weight-form" class="modal-form">
          <label class="field">
            <span>الوزن الجديد (كغ)</span>
            <input type="number" step="0.1" name="weight" value="${p.currentWeight}" min="30" max="300" required />
          </label>
          <button class="btn btn-primary btn-block" type="submit">حفظ</button>
        </form>
      `,
      onMount: (overlay) => {
        overlay.querySelector('#weight-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const val = Number(new FormData(e.target).get('weight'));
          p.currentWeight = val;
          state.progressHistory.weights.push({ date: t.date, value: val });
          saveState();
          closeModal();

          const refStart = state.progressHistory.weights[0]?.value ?? val;
          const newTotalToLose = Math.abs(refStart - p.goalWeight) || 1;
          const newDoneSoFar = Math.abs(refStart - val);
          const newPct = clamp(Math.round((newDoneSoFar / newTotalToLose) * 100), 0, 100);

          wrap.querySelector('#weight-value').innerHTML = `${val} <small>كغ</small>`;
          wrap.querySelector('#weight-goal-row').innerHTML = `${icon('scale', 'muted-icon')}<span>الهدف: ${p.goalWeight} كغ &nbsp;•&nbsp; متبقي ${Math.abs(val - p.goalWeight).toFixed(1)} كغ</span>`;
          updateProgressBar(wrap.querySelector('#weight-progress'), newPct, 100);
        });
      },
    });
  });
}
