import { state, saveState, el, navigate, uid } from '../app.js';
import { icon } from '../assets/icons.js';
import { openModal, closeModal } from '../components/modal.js';

export function renderProgress(root) {
  const weights = state.progressHistory.weights;
  const records = state.progressHistory.personalRecords;

  const wrap = el(`
    <div class="page progress-page">
      <header class="page-header">
        <button class="icon-btn" id="back-btn">${icon('chevronRight')}</button>
        <h1>التقدم</h1>
        <span class="header-spacer"></span>
      </header>

      <section class="card">
        <div class="card-header">
          <h3 class="card-title">${icon('scale')} منحنى الوزن</h3>
          <span class="card-subtitle">${weights.length} قياس</span>
        </div>
        <canvas id="weight-chart" width="600" height="220" class="chart-canvas"></canvas>
      </section>

      <section class="card">
        <div class="card-header">
          <h3 class="card-title">${icon('trophy')} الأرقام القياسية الشخصية</h3>
          <button class="icon-btn" id="add-pr-btn">${icon('plus')}</button>
        </div>
        <ul class="pr-list">
          ${records.length === 0 ? '<li class="empty-hint">لا توجد أرقام قياسية بعد</li>' : ''}
          ${records.map((r) => `
            <li class="pr-item">
              <span>${r.name}</span>
              <span class="pr-value">${r.value}</span>
            </li>
          `).join('')}
        </ul>
      </section>
    </div>
  `);

  root.appendChild(wrap);
  wrap.querySelector('#back-btn').addEventListener('click', () => navigate('dashboard'));

  drawWeightChart(wrap.querySelector('#weight-chart'), weights);

  wrap.querySelector('#add-pr-btn').addEventListener('click', () => {
    openModal({
      title: 'إضافة رقم قياسي',
      bodyHTML: `
        <form id="pr-form" class="modal-form">
          <label class="field">
            <span>التمرين / السباق</span>
            <input type="text" name="name" placeholder="مثال: سكوات" required />
          </label>
          <label class="field">
            <span>الرقم المحقق</span>
            <input type="text" name="value" placeholder="مثال: 100 كغ أو 25:30 دقيقة" required />
          </label>
          <button class="btn btn-primary btn-block" type="submit">حفظ</button>
        </form>
      `,
      onMount: (overlay) => {
        overlay.querySelector('#pr-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const data = new FormData(e.target);
          records.push({ id: uid('pr'), name: data.get('name'), value: data.get('value') });
          saveState();
          closeModal();
          root.innerHTML = '';
          renderProgress(root);
        });
      },
    });
  });
}

function drawWeightChart(canvas, weights) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (weights.length < 2) {
    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('أضف وزنك بانتظام لرؤية المنحنى', w / 2, h / 2);
    return;
  }

  const values = weights.map((p) => p.value);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const padding = 24;

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 3; i++) {
    const y = padding + ((h - padding * 2) / 3) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(w - padding, y);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.strokeStyle = '#22C55E';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';

  weights.forEach((point, i) => {
    const x = padding + ((w - padding * 2) / (weights.length - 1)) * i;
    const y = h - padding - ((point.value - min) / (max - min)) * (h - padding * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  weights.forEach((point, i) => {
    const x = padding + ((w - padding * 2) / (weights.length - 1)) * i;
    const y = h - padding - ((point.value - min) / (max - min)) * (h - padding * 2);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#22C55E';
    ctx.fill();
  });
}
