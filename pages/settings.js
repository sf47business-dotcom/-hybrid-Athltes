import { state, saveState, el, navigate } from '../app.js';
import { icon } from '../assets/icons.js';

export function renderSettings(root) {
  const p = state.profile;
  const s = state.settings;

  const wrap = el(`
    <div class="page settings-page">
      <header class="page-header">
        <button class="icon-btn" id="back-btn">${icon('chevronRight')}</button>
        <h1>الإعدادات</h1>
        <span class="header-spacer"></span>
      </header>

      <section class="card">
        <div class="card-header"><h3 class="card-title">الملف الشخصي</h3></div>
        <form id="profile-form" class="modal-form">
          <label class="field">
            <span>الاسم</span>
            <input type="text" name="name" value="${p.name}" required />
          </label>
          <div class="field-row">
            <label class="field">
              <span>الوزن المستهدف (كغ)</span>
              <input type="number" name="goalWeight" value="${p.goalWeight}" min="30" max="300" />
            </label>
            <label class="field">
              <span>الطول (سم)</span>
              <input type="number" name="height" value="${p.height}" min="100" max="250" />
            </label>
          </div>
          <button class="btn btn-primary btn-block" type="submit">حفظ التغييرات</button>
        </form>
      </section>

      <section class="card">
        <div class="card-header"><h3 class="card-title">التفضيلات</h3></div>
        <label class="switch-row">
          <span>${icon('moon')} الوضع الليلي</span>
          <input type="checkbox" id="dark-toggle" ${s.darkMode ? 'checked' : ''} />
        </label>
        <label class="switch-row">
          <span>${icon('bolt')} التنبيهات</span>
          <input type="checkbox" id="notif-toggle" ${s.notifications ? 'checked' : ''} />
        </label>
      </section>

      <section class="card">
        <div class="card-header"><h3 class="card-title">البيانات</h3></div>
        <button class="btn btn-ghost btn-block" id="export-btn">${icon('download')} تصدير نسخة احتياطية</button>
        <button class="btn btn-danger btn-block" id="reset-btn">${icon('trash')} إعادة تعيين كل البيانات</button>
      </section>

      <p class="app-version">Hybrid Blueprint — النسخة 1.4</p>
    </div>
  `);

  root.appendChild(wrap);
  wrap.querySelector('#back-btn').addEventListener('click', () => navigate('dashboard'));

  wrap.querySelector('#profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    p.name = data.get('name').trim();
    p.goalWeight = Number(data.get('goalWeight'));
    p.height = Number(data.get('height'));
    saveState();
    navigate('dashboard');
  });

  wrap.querySelector('#dark-toggle').addEventListener('change', (e) => {
    s.darkMode = e.target.checked;
    document.documentElement.classList.toggle('light-mode', !s.darkMode);
    saveState();
  });

  wrap.querySelector('#notif-toggle').addEventListener('change', (e) => {
    s.notifications = e.target.checked;
    saveState();
  });

  wrap.querySelector('#export-btn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hybrid-blueprint-backup-${state.today.date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  wrap.querySelector('#reset-btn').addEventListener('click', () => {
    if (confirm('هل أنت متأكد؟ سيتم حذف كل البيانات المحفوظة نهائيًا.')) {
      localStorage.removeItem('hybridBlueprint.v1');
      window.location.reload();
    }
  });
}
