import { enhance } from '../../scripts/scroll-fx.js';

/*
 * global-map — "Global Partnership" (Section 5).
 * Row 1: header (eyebrow, h2, lede).
 * Rows 2..n: stats — cell 1 = value (e.g. "990+", "3,500"), cell 2 = label.
 * A stylized graticule world with partner nodes that illuminate on reveal, and
 * stat counters that count up when they enter view.
 */

// scattered partner-node coordinates over a 1000x500 graticule
const NODES = [
  [170, 150], [250, 210], [230, 300], [430, 130], [470, 200], [500, 250],
  [520, 160], [540, 300], [610, 180], [660, 240], [780, 210], [820, 300],
  [700, 330], [400, 260],
];
const HOME = [470, 200];

function buildMap() {
  const grat = [];
  for (let i = 1; i < 6; i += 1) {
    grat.push(`<ellipse cx="500" cy="250" rx="${480}" ry="${i * 44}" />`);
  }
  for (let i = 0; i < 9; i += 1) {
    const rx = 40 + i * 55;
    grat.push(`<ellipse cx="500" cy="250" rx="${rx}" ry="220" />`);
  }
  const arcs = NODES.map(([x, y]) => {
    const mx = (x + HOME[0]) / 2;
    const my = Math.min(y, HOME[1]) - 60;
    return `<path class="gm-arc" d="M${HOME[0]} ${HOME[1]} Q${mx} ${my} ${x} ${y}" />`;
  }).join('');
  const nodes = NODES.map(([x, y], i) => `
    <g class="gm-node" style="--gm-i:${i}">
      <circle class="gm-halo" cx="${x}" cy="${y}" r="12" />
      <circle class="gm-dot" cx="${x}" cy="${y}" r="4" />
    </g>`).join('');

  return `
    <svg viewBox="0 0 1000 500" class="gm-svg" role="img"
         aria-label="Global F-35 partner network" xmlns="http://www.w3.org/2000/svg">
      <g class="gm-grat" fill="none">${grat.join('')}</g>
      <g fill="none">${arcs}</g>
      ${nodes}
    </svg>`;
}

function parseStat(text) {
  const m = text.replace(/,/g, '').match(/([\d.]+)(.*)$/);
  return m ? { value: m[1], suffix: (m[2] || '').trim() } : { value: '0', suffix: text };
}

export default function decorate(block) {
  const rows = [...block.children];
  const [headRow, ...statRows] = rows;

  if (headRow) {
    headRow.className = 'gm-head';
    headRow.setAttribute('data-reveal', '');
    const eyebrow = headRow.querySelector('p:first-child');
    if (eyebrow && !eyebrow.querySelector('a')) eyebrow.classList.add('fx-eyebrow');
    const lede = headRow.querySelector('h2 ~ p');
    if (lede) lede.classList.add('fx-lede');
  }

  const stage = document.createElement('div');
  stage.className = 'gm-stage';

  const map = document.createElement('div');
  map.className = 'gm-map';
  map.setAttribute('data-reveal', 'fade');
  map.innerHTML = buildMap();
  stage.append(map);

  const stats = document.createElement('div');
  stats.className = 'gm-stats';
  statRows.forEach((row) => {
    const cells = [...row.children];
    const { value, suffix } = parseStat((cells[0]?.textContent || '').trim());
    const label = cells[1]?.textContent.trim() || '';
    const item = document.createElement('div');
    item.className = 'gm-stat';
    item.innerHTML = `
      <span class="gm-value" data-count="${value}"${suffix ? ` data-count-suffix="${suffix}"` : ''}>0</span>
      <span class="gm-label">${label}</span>`;
    stats.append(item);
  });
  stage.append(stats);

  statRows.forEach((r) => r.remove());
  block.append(stage);
  enhance(block);
}
