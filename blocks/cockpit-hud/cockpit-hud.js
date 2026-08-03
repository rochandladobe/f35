import { enhance } from '../../scripts/scroll-fx.js';

/*
 * cockpit-hud — "Pilot Experience" (Section 6).
 * Row 1: header (eyebrow, h2).
 * Row 2: pilot quote — cell 1 = quote, cell 2 = attribution.
 * Rows 3..n: interactive HUD callouts — cell 1 = label, cell 2 = detail.
 * Callouts are keyboard-focusable hotspots that reveal their detail.
 */

const HUD = `
<svg viewBox="0 0 600 400" class="ch-reticle" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none">
  <circle cx="300" cy="200" r="120" class="ch-ring" />
  <circle cx="300" cy="200" r="70" class="ch-ring ch-ring-in" />
  <path d="M300 40v60M300 300v60M120 200h60M420 200h60" class="ch-tick" />
  <path d="M240 200h120M300 140v120" class="ch-cross" />
  <path d="M180 120l30 30M420 120l-30 30M180 280l30-30M420 280l-30-30" class="ch-tick" />
  <path d="M270 200a30 8 0 0 1 60 0" class="ch-cross" />
</svg>`;

const READOUTS = [
  ['HDG', '047'], ['ALT', '28,000'], ['SPD', '0.92M'], ['G', '1.0'],
];
const POS = ['ch-hot-a', 'ch-hot-b', 'ch-hot-c', 'ch-hot-d'];

export default function decorate(block) {
  const rows = [...block.children];
  const headRow = rows[0];
  const quoteRow = rows[1];
  const calloutRows = rows.slice(2);

  if (headRow) {
    headRow.className = 'ch-head';
    headRow.setAttribute('data-reveal', '');
    const eyebrow = headRow.querySelector('p:first-child');
    if (eyebrow && !eyebrow.querySelector('a')) eyebrow.classList.add('fx-eyebrow');
  }

  const stage = document.createElement('div');
  stage.className = 'ch-stage';
  stage.setAttribute('data-reveal', 'fade');

  // canopy + HUD layers (parallax depth)
  stage.innerHTML = `
    <div class="ch-canopy" aria-hidden="true"></div>
    <div class="ch-hud" data-parallax="0.06">${HUD}</div>
    <div class="ch-readouts" aria-hidden="true">
      ${READOUTS.map(([k, v]) => `<span class="ch-readout"><b>${k}</b> ${v}</span>`).join('')}
    </div>`;

  // interactive callouts
  const callouts = document.createElement('div');
  callouts.className = 'ch-callouts';
  calloutRows.forEach((row, i) => {
    const cells = [...row.children];
    const label = cells[0]?.textContent.trim() || '';
    const detail = cells[1]?.textContent.trim() || '';
    const id = `ch-tip-${i}`;
    const hot = document.createElement('div');
    hot.className = `ch-hot ${POS[i % POS.length]}`;
    hot.innerHTML = `
      <button type="button" class="ch-hot-btn" aria-describedby="${id}">
        <span class="ch-hot-mark"></span>
        <span class="ch-hot-label">${label}</span>
      </button>
      <span role="tooltip" id="${id}" class="ch-tip">${detail}</span>`;
    callouts.append(hot);
  });
  stage.append(callouts);

  // pilot quote
  if (quoteRow) {
    const cells = [...quoteRow.children];
    const quote = cells[0]?.textContent.trim() || '';
    const cite = cells[1]?.textContent.trim() || '';
    const fig = document.createElement('figure');
    fig.className = 'ch-quote';
    fig.setAttribute('data-reveal', '');
    fig.innerHTML = `<blockquote>${quote}</blockquote>${cite ? `<figcaption>${cite}</figcaption>` : ''}`;
    stage.append(fig);
    quoteRow.remove();
  }

  calloutRows.forEach((r) => r.remove());
  block.append(stage);
  enhance(block);
}
