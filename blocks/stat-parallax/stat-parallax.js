import { enhance } from '../../scripts/scroll-fx.js';

/*
 * stat-parallax — "Designed for Dominance" (Section 2).
 * Row 1: section header (eyebrow p, h2, lede p).
 * Rows 2..n: floating capability chips — cell 1 = term, cell 2 = short descriptor.
 * A central aircraft silhouette and the chips sit at different parallax depths.
 */

const CRAFT = `
<svg viewBox="0 0 320 420" class="sp-craft-svg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <path fill="rgba(58,68,79,0.55)" stroke="rgba(90,169,255,0.30)" stroke-width="1" d="
    M160 10 L170 82 L182 126 L200 140 L300 246 L286 260 L210 244 L206 292
    L254 348 L240 362 L196 328 L190 376 L172 408 L160 416 L148 408 L130 376
    L124 328 L80 362 L66 348 L114 292 L110 244 L34 260 L20 246 L120 140
    L138 126 L150 82 Z"/>
</svg>`;

const CHIP_POS = ['sp-chip-tl', 'sp-chip-tr', 'sp-chip-bl', 'sp-chip-br'];
const CHIP_SPEED = ['0.18', '-0.14', '-0.2', '0.16'];

export default function decorate(block) {
  const rows = [...block.children];
  const [headRow, ...statRows] = rows;

  // header
  if (headRow) {
    headRow.className = 'sp-head';
    headRow.setAttribute('data-reveal', '');
    const eyebrow = headRow.querySelector('p:first-child');
    if (eyebrow && !eyebrow.querySelector('a')) eyebrow.classList.add('fx-eyebrow');
    const lede = headRow.querySelector('h2 ~ p');
    if (lede) lede.classList.add('fx-lede');
  }

  // stage with craft + chips
  const stage = document.createElement('div');
  stage.className = 'sp-stage';

  const craft = document.createElement('div');
  craft.className = 'sp-craft';
  craft.setAttribute('data-parallax', '-0.08');
  craft.innerHTML = CRAFT;
  stage.append(craft);

  statRows.forEach((row, i) => {
    const cell = row.firstElementChild || row;
    const cells = [...row.children];
    const term = (cells[0]?.textContent || '').trim();
    const desc = (cells[1]?.textContent || '').trim();
    const chip = document.createElement('div');
    chip.className = `sp-chip ${CHIP_POS[i % CHIP_POS.length]}`;
    chip.setAttribute('data-reveal', 'scale');
    chip.setAttribute('data-parallax', CHIP_SPEED[i % CHIP_SPEED.length]);
    const descHtml = desc ? `<span class="sp-chip-desc">${desc}</span>` : '';
    chip.innerHTML = `<span class="sp-chip-dot"></span><span class="sp-chip-term">${term}</span>${descHtml}`;
    stage.append(chip);
    row.remove();
    cell.remove();
  });

  block.append(stage);
  enhance(block);
}
