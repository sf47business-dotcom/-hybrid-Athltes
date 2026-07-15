export function progressBar({ value, max, color = 'primary', label = '', showText = true }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100 || 0));
  return `
    <div class="progress-wrap">
      ${label ? `<div class="progress-label-row">
        <span>${label}</span>
        ${showText ? `<span class="progress-value">${value} / ${max}</span>` : ''}
      </div>` : ''}
      <div class="progress-track">
        <div class="progress-fill progress-fill-${color}" style="width:${pct}%"></div>
      </div>
    </div>
  `;
}

export function progressRing({ value, max, color = 'primary', size = 120, strokeWidth = 10, label = '', centerLabel = '' }) {
  const pct = Math.max(0, Math.min(1, value / max || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  return `
    <div class="ring-wrap" style="width:${size}px">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="ring-svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" class="ring-track" stroke-width="${strokeWidth}" fill="none"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" class="ring-fill ring-fill-${color}"
          stroke-width="${strokeWidth}" fill="none"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"
          transform="rotate(-90 ${size / 2} ${size / 2})"/>
      </svg>
      <div class="ring-center">
        <span class="ring-center-value">${centerLabel || Math.round(pct * 100) + '%'}</span>
        ${label ? `<span class="ring-center-label">${label}</span>` : ''}
      </div>
    </div>
  `;
}

/**
 * يحدّث حلقة تقدم موجودة في الصفحة دون إعادة رسم الـ HTML بالكامل.
 * أكثر كفاءة من renderDashboard الكامل عند كل نقرة بسيطة.
 */
export function updateProgressRing(ringWrap, value, max, centerLabel) {
  const fill = ringWrap.querySelector('.ring-fill');
  const text = ringWrap.querySelector('.ring-center-value');
  if (!fill || !text) return;
  const r = Number(fill.getAttribute('r'));
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max || 0));
  fill.style.strokeDashoffset = circumference * (1 - pct);
  text.textContent = centerLabel ?? `${Math.round(pct * 100)}%`;
}

/** يحدّث شريط تقدم موجود دون إعادة رسمه. */
export function updateProgressBar(barWrap, value, max, valueText) {
  const fill = barWrap.querySelector('.progress-fill');
  const text = barWrap.querySelector('.progress-value');
  if (!fill) return;
  const pct = Math.max(0, Math.min(100, (value / max) * 100 || 0));
  fill.style.width = `${pct}%`;
  if (text && valueText) text.textContent = valueText;
}
