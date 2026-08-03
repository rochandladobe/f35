import { enhance } from '../../scripts/scroll-fx.js';

/*
 * resource-grid — "Resources" (Section 9).
 * Row 1: header (eyebrow, h2).
 * Rows 2..n: resource cards — cell 1 = title link (a), cell 2 = description.
 * Each card is a large, fully-clickable link.
 */

export default function decorate(block) {
  const rows = [...block.children];
  const [headRow, ...cardRows] = rows;

  if (headRow) {
    headRow.className = 'rg-head';
    headRow.setAttribute('data-reveal', '');
    const eyebrow = headRow.querySelector('p:first-child');
    if (eyebrow && !eyebrow.querySelector('a')) eyebrow.classList.add('fx-eyebrow');
  }

  const grid = document.createElement('div');
  grid.className = 'rg-grid';

  cardRows.forEach((row, i) => {
    const cells = [...row.children];
    const link = cells[0]?.querySelector('a');
    const title = (link?.textContent || cells[0]?.textContent || '').trim();
    const href = link?.getAttribute('href') || '#';
    const desc = cells[1]?.textContent.trim() || '';

    const card = document.createElement('a');
    card.className = 'rg-card';
    card.href = href;
    card.setAttribute('data-reveal', '');
    card.style.setProperty('--rg-i', i);
    card.innerHTML = `
      <span class="rg-num">0${i + 1}</span>
      <span class="rg-body">
        <span class="rg-title">${title}</span>
        ${desc ? `<span class="rg-desc">${desc}</span>` : ''}
      </span>
      <span class="rg-arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </span>`;
    grid.append(card);
  });

  cardRows.forEach((r) => r.remove());
  block.append(grid);
  enhance(block);
}
