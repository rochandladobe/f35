import { enhance } from '../../scripts/scroll-fx.js';

/*
 * timeline-parallax — "Innovation Timeline" (Section 7).
 * Row 1: header (eyebrow, h2).
 * Rows 2..n: milestones — cell 1 = phase/title, cell 2 = year (optional short),
 *            cell 3 = description. Milestones reveal as they scroll into view;
 *            years drift with subtle parallax.
 */

export default function decorate(block) {
  const rows = [...block.children];
  const [headRow, ...items] = rows;

  if (headRow) {
    headRow.className = 'tp-head';
    headRow.setAttribute('data-reveal', '');
    const eyebrow = headRow.querySelector('p:first-child');
    if (eyebrow && !eyebrow.querySelector('a')) eyebrow.classList.add('fx-eyebrow');
  }

  const line = document.createElement('div');
  line.className = 'tp-line';

  items.forEach((row, i) => {
    const cells = [...row.children];
    const title = cells[0]?.textContent.trim() || '';
    // second cell counts as a short "year" marker only if it's short
    const maybeYear = cells[1]?.textContent.trim() || '';
    const isYear = maybeYear && maybeYear.length <= 12;
    const desc = (isYear ? cells[2] : cells[1])?.innerHTML || '';

    const item = document.createElement('div');
    item.className = `tp-item ${i % 2 ? 'tp-item-right' : 'tp-item-left'}`;
    item.setAttribute('data-reveal', i % 2 ? 'right' : 'left');
    item.innerHTML = `
      <span class="tp-node" aria-hidden="true"></span>
      ${isYear ? `<span class="tp-year" data-parallax="0.05">${maybeYear}</span>` : ''}
      <div class="tp-card">
        <span class="tp-step">Phase 0${i + 1}</span>
        <h3 class="tp-title">${title}</h3>
        ${desc ? `<div class="tp-desc">${desc}</div>` : ''}
      </div>`;
    line.append(item);
  });

  items.forEach((r) => r.remove());
  block.append(line);
  enhance(block);
}
