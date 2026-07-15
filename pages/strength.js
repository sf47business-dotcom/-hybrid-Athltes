import { state, saveState, el, navigate, fetchJSON } from '../app.js';
import { icon } from '../assets/icons.js';

export async function renderStrength(root) {
  const wrap = el(`
    <div class="page strength-page">
      <header class="page-header">
        <button class="icon-btn" id="back-btn">${icon('chevronRight')}</button>
        <h1>تمارين القوة</h1>
        <span class="header-spacer"></span>
      </header>
      <div class="loading-hint">${icon('clock')} جارِ تحميل البرنامج...</div>
    </div>
  `);
  root.appendChild(wrap);
  wrap.querySelector('#back-btn').addEventListener('click', () => navigate('dashboard'));

  let program;
  try {
    program = await fetchJSON('./data/strength/hybrid-athlete.json');
  } catch (err) {
    wrap.querySelector('.loading-hint').textContent = 'تعذر تحميل برنامج التمارين.';
    console.warn(err);
    return;
  }

  wrap.querySelector('.loading-hint').remove();

  const intro = el(`
    <section class="card strength-intro">
      <h3 class="card-title">${icon('strength')} ${program.programTitle}</h3>
      <p class="card-subtitle">${program.subtitle}</p>
    </section>
  `);
  wrap.appendChild(intro);

  const list = el(`<div class="program-list"></div>`);
  wrap.appendChild(list);

  program.days.forEach((day) => {
    if (!state.strengthLog[day.day]) state.strengthLog[day.day] = { history: [] };
    const log = state.strengthLog[day.day];

    const details = el(`
      <details class="card program-card">
        <summary class="program-summary">
          <div class="program-summary-text">
            ${icon('strength')}
            <div>
              <h3>${day.title}</h3>
              <span class="card-subtitle">${day.exercises.length} تمارين</span>
            </div>
          </div>
          ${icon('chevronLeft', 'chevron-indicator')}
        </summary>
        <div class="program-details">
          <table class="exercise-table">
            <thead>
              <tr><th>التمرين</th><th>مجموعات</th><th>تكرارات</th><th>راحة</th></tr>
            </thead>
            <tbody>
              ${day.exercises.map((ex) => `
                <tr>
                  <td>${ex.name}</td>
                  <td>${ex.sets}</td>
                  <td>${ex.reps}</td>
                  <td>${ex.rest}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p class="last-session" data-history>${log.history.length ? `آخر مرة: ${log.history[log.history.length - 1]}` : 'لم تُسجَّل أي جلسة بعد'} • مجموع الجلسات: <span data-count>${log.history.length}</span></p>
          <button class="btn btn-primary btn-sm" data-log-day="${day.day}">تسجيل جلسة اليوم</button>
        </div>
      </details>
    `);
    list.appendChild(details);

    details.querySelector('[data-log-day]').addEventListener('click', () => {
      log.history.push(state.today.date);
      saveState();
      details.querySelector('[data-history]').innerHTML = `آخر مرة: ${state.today.date} • مجموع الجلسات: <span data-count>${log.history.length}</span>`;
    });
  });
}
