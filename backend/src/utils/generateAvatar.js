/**
 * SVG Avatar Generator
 * (generateAvatar.js)
 */

function generateAvatar(name = 'M') {
  const char = (name.replace('Mingling User #', '').trim() || 'M').charAt(0).toUpperCase();
  const colors = [
    ['#6366f1', '#a855f7'],
    ['#3b82f6', '#10b981'],
    ['#f59e0b', '#ef4444'],
    ['#ec4899', '#8b5cf6'],
    ['#14b8a6', '#6366f1']
  ];
  const pair = colors[Math.floor(Math.random() * colors.length)];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
    <defs>
      <linearGradient id="grad-${char}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${pair[0]}" />
        <stop offset="100%" stop-color="${pair[1]}" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#grad-${char})" />
    <text x="50" y="58" font-family="'Plus Jakarta Sans', sans-serif" font-size="42" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${char}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

module.exports = generateAvatar;
