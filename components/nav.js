import { icon } from '../assets/icons.js';

const NAV_ITEMS = [
  { route: 'dashboard', label: 'الرئيسية', icon: 'dashboard' },
  { route: 'nutrition', label: 'التغذية', icon: 'nutrition' },
  { route: 'running', label: 'الجري', icon: 'running' },
  { route: 'strength', label: 'القوة', icon: 'strength' },
  { route: 'progress', label: 'التقدم', icon: 'progress' },
];

export function renderNav(navEl, activeRoute) {
  navEl.innerHTML = NAV_ITEMS.map((item) => `
    <a href="#${item.route}" class="nav-item ${activeRoute === item.route ? 'active' : ''}" data-route="${item.route}">
      ${icon(item.icon, 'nav-icon')}
      <span class="nav-label">${item.label}</span>
    </a>
  `).join('');
}
