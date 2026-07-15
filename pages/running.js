import { state, saveState, el, navigate, fetchJSON, clamp } from '../app.js';
import { icon } from '../assets/icons.js';
import { progressBar } from '../components/progressbar.js';

const PROGRAM_FILES = [
  { id: 'beginner', file: './data/running/beginner.json' },
  { id: '5k', file: './data/running/5k.json' },
  { id: '10k', file: './data/running/10k.json' },
  { id: 'half-marathon', file: './data/running/half-marathon.json' },
];

function getProgress(id) {
  if (!state.runningProgress[id]) {
    state.runningProgress[id] = { currentWeek: 1, completedDays: [] };
  }
  return state.runningProgress[id];
}

export async function renderRunning(root) {
  const wrap = el(`
    <div class="page running-page">
      <header class="page-header">
        <button class="icon-btn" id="back-btn">${icon('chevronRight')}</button>
        <h1>برامج الجري</h1>
        <span class="header-spacer"></span>
      </header>
      <div class="loading-hint">${icon('clock')} جارِ تحميل البرامج...</div>
    </div>
  `);
  root.appendChild(wrap);
  wrap.querySelector('#back-btn').addEventListener('click', () => navigate('dashboard'));

  let programs;
  try {
    programs = await Promise.all(PROGRAM_FILES.map((p) => fetchJSON(p.file)));
  } catch (err) {
    wrap.querySelector('.loading-hint').textContent = 'تعذر تحميل برامج الجري.';
    console.warn(err);
    return;
  }

  wrap.querySelector('.loading-hint').remove();

  const list = el(`<div class="program-list"></div>`);
  wrap.appendChild(list);

  programs.forEach((prog) => {
    const progress = getProgress(prog.id);
    const totalWeeks = prog.weeks.length;

    const details = el(`
      <details class="card program-card">
        <summary class="program-summary">
          <div class="program-summary-text">
            ${icon('running')}
            <div>
              <h3>${prog.title}</h3>
              <span class="card-subtitle">${prog.subtitle}</span>
            </div>
          </div>
          ${icon('chevronLeft', 'chevron-indicator')}
        </summary>
        <div class="program-details">
          <div class="week-progress"></div>
          <ul class="program-plan"></ul>
          <div class="program-actions">
            <button class="btn btn-ghost btn-sm" data-action="prev">السابق</button>
            <button class="btn btn-primary btn-sm" data-action="next">إتمام هذا الأسبوع</button>
          </div>
        </div>
      </details>
    `);
    list.appendChild(details);

    function renderProgramBody() {
      details.querySelector('.week-progress').innerHTML = progressBar({
        value: progress.currentWeek,
        max: totalWeeks,
        color: 'secondary',
        label: `الأسبوع ${progress.currentWeek} من ${totalWeeks}`,
      });
      details.querySelector('.program-plan').innerHTML = prog.weeks.map((w) => `
        <li class="${w.week < progress.currentWeek ? 'plan-done' : ''} ${w.week === progress.currentWeek ? 'plan-current' : ''}">
          <strong>الأسبوع ${w.week}${w.focus ? ` — ${w.focus}` : ''}:</strong> ${w.plan}
        </li>
      `).join('');
      const nextBtn = details.querySelector('[data-action="next"]');
      nextBtn.disabled = progress.currentWeek >= totalWeeks;
    }

    details.querySelector('[data-action="next"]').addEventListener('click', () => {
      progress.currentWeek = clamp(progress.currentWeek + 1, 1, totalWeeks);
      saveState();
      renderProgramBody();
    });
    details.querySelector('[data-action="prev"]').addEventListener('click', () => {
      progress.currentWeek = clamp(progress.currentWeek - 1, 1, totalWeeks);
      saveState();
      renderProgramBody();
    });

    renderProgramBody();
  });
}
