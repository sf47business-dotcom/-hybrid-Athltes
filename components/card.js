export function card({ title = '', subtitle = '', content = '', className = '', accent = '' }) {
  return `
    <div class="card ${className} ${accent ? `card-accent-${accent}` : ''}">
      ${title ? `<div class="card-header">
        <h3 class="card-title">${title}</h3>
        ${subtitle ? `<span class="card-subtitle">${subtitle}</span>` : ''}
      </div>` : ''}
      <div class="card-body">${content}</div>
    </div>
  `;
}

export function statCard({ icon = '', label = '', value = '', unit = '', color = 'primary' }) {
  return `
    <div class="stat-card">
      <div class="stat-icon stat-icon-${color}">${icon}</div>
      <div class="stat-info">
        <span class="stat-value">${value}<span class="stat-unit">${unit}</span></span>
        <span class="stat-label">${label}</span>
      </div>
    </div>
  `;
}
