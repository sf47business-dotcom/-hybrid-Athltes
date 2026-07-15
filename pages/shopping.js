import { state, saveState, el, uid, navigate } from '../app.js';
import { icon } from '../assets/icons.js';

export function renderShopping(root) {
  const list = state.shoppingList;

  const wrap = el(`
    <div class="page shopping-page">
      <header class="page-header">
        <button class="icon-btn" id="back-btn">${icon('chevronRight')}</button>
        <h1>قائمة التسوق</h1>
        <span class="header-spacer"></span>
      </header>

      <form class="add-item-row" id="add-shopping-form">
        <input type="text" name="item" placeholder="أضف عنصرًا..." required />
        <button class="btn btn-primary btn-icon-only" type="submit">${icon('plus')}</button>
      </form>

      <ul class="shopping-list" id="shopping-list">
        ${list.length === 0 ? '<li class="empty-hint">القائمة فارغة</li>' : ''}
        ${list.map((item) => `
          <li class="shopping-item ${item.done ? 'done' : ''}" data-id="${item.id}">
            <button class="task-check">${item.done ? icon('check') : ''}</button>
            <div class="shopping-item-info">
              <span>${item.text}</span>
              ${item.qty ? `<span class="shopping-qty">${item.qty}</span>` : ''}
            </div>
            <button class="icon-btn remove-item" data-id="${item.id}">${icon('trash')}</button>
          </li>
        `).join('')}
      </ul>
    </div>
  `);

  root.appendChild(wrap);
  wrap.querySelector('#back-btn').addEventListener('click', () => navigate('dashboard'));

  wrap.querySelector('#add-shopping-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const text = data.get('item').trim();
    if (!text) return;
    list.push({ id: uid('shop'), text, done: false, qty: '' });
    saveState();
    root.innerHTML = '';
    renderShopping(root);
  });

  wrap.querySelectorAll('.shopping-item .task-check').forEach((btn) => {
    btn.addEventListener('click', () => {
      const li = btn.closest('.shopping-item');
      const item = list.find((x) => x.id === li.dataset.id);
      item.done = !item.done;
      saveState();
      root.innerHTML = '';
      renderShopping(root);
    });
  });

  wrap.querySelectorAll('.remove-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      state.shoppingList = list.filter((x) => x.id !== id);
      saveState();
      root.innerHTML = '';
      renderShopping(root);
    });
  });
}
