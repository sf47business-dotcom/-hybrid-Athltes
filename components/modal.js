import { icon } from '../assets/icons.js';

let activeModal = null;

export function openModal({ title, bodyHTML, onMount, onClose }) {
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-sheet" role="dialog" aria-modal="true">
      <div class="modal-handle"></div>
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="icon-btn modal-close" aria-label="إغلاق">${icon('close')}</button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.classList.add('modal-open');
  activeModal = overlay;

  requestAnimationFrame(() => overlay.classList.add('open'));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(onClose);
  });
  overlay.querySelector('.modal-close').addEventListener('click', () => closeModal(onClose));

  if (onMount) onMount(overlay);
  return overlay;
}

export function closeModal(onClose) {
  if (!activeModal) return;
  activeModal.classList.remove('open');
  document.body.classList.remove('modal-open');
  const toRemove = activeModal;
  activeModal = null;
  setTimeout(() => toRemove.remove(), 220);
  if (onClose) onClose();
}
