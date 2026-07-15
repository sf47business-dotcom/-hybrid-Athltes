import { state, saveState, el } from '../app.js';
import { icon } from '../assets/icons.js';

export function renderOnboarding(root, { onDone }) {
  const wrap = el(`
    <div class="onboarding">
      <div class="onboarding-brand">
        <div class="brand-mark">${icon('bolt')}</div>
        <h1>Hybrid Blueprint</h1>
        <p>خطتك الشخصية للتغذية، الجري، والقوة — كلها في مكان واحد وبدون إنترنت</p>
      </div>

      <form class="onboarding-form">
        <label class="field">
          <span>اسمك</span>
          <input type="text" name="name" placeholder="مثال: سيف" required />
        </label>

        <div class="field-row">
          <label class="field">
            <span>وزنك الحالي (كغ)</span>
            <input type="number" name="currentWeight" min="30" max="300" value="78" required />
          </label>
          <label class="field">
            <span>وزنك المستهدف (كغ)</span>
            <input type="number" name="goalWeight" min="30" max="300" value="72" required />
          </label>
        </div>

        <label class="field">
          <span>الطول (سم)</span>
          <input type="number" name="height" min="100" max="250" value="175" required />
        </label>

        <button type="submit" class="btn btn-primary btn-block">ابدأ الرحلة ${icon('chevronLeft')}</button>
      </form>
    </div>
  `);

  root.appendChild(wrap);

  wrap.querySelector('.onboarding-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    state.profile.name = data.get('name').trim() || 'بطل';
    state.profile.currentWeight = Number(data.get('currentWeight'));
    state.profile.goalWeight = Number(data.get('goalWeight'));
    state.profile.height = Number(data.get('height'));
    state.profile.onboarded = true;
    state.progressHistory.weights.push({ date: state.today.date, value: state.profile.currentWeight });
    saveState();
    onDone();
  });
}
