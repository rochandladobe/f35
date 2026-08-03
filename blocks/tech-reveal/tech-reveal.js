import { enhance } from '../../scripts/scroll-fx.js';

/*
 * tech-reveal — "Technology" (Section 3).
 * Row 1: section header (eyebrow, h2, lede).
 * Rows 2..n: technology cards — cell 1 = title, cell 2 = description.
 * Cards reveal independently with a stagger; each gets a generated HUD glyph.
 */

const GLYPHS = [
  '<path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z"/>', // stealth (shield)
  '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>', // sensor fusion (radiate)
  '<path d="M4 13l6-9v6h10l-6 9v-6z"/>', // electronic warfare (bolt)
  '<circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 12l10-6M7 12l10 6"/>', // networking (nodes)
  '<path d="M9 3h6l1 4a6 6 0 1 1-8 0z"/><path d="M12 11v4M10 21h4"/>', // AI (chip/brain)
];

export default function decorate(block) {
  const rows = [...block.children];
  const [headRow, ...cardRows] = rows;

  if (headRow) {
    headRow.className = 'tr-head';
    headRow.setAttribute('data-reveal', '');
    const eyebrow = headRow.querySelector('p:first-child');
    if (eyebrow && !eyebrow.querySelector('a')) eyebrow.classList.add('fx-eyebrow');
    const lede = headRow.querySelector('h2 ~ p');
    if (lede) lede.classList.add('fx-lede');
  }

  const grid = document.createElement('div');
  grid.className = 'tr-grid';

  cardRows.forEach((row, i) => {
    const cells = [...row.children];
    const title = cells[0]?.textContent.trim() || '';
    const desc = cells[1]?.innerHTML || '';
    const card = document.createElement('article');
    card.className = 'tr-card';
    card.setAttribute('data-reveal', '');
    card.style.setProperty('--tr-i', i);
    card.innerHTML = `
      <span class="tr-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" stroke-linejoin="round">${GLYPHS[i % GLYPHS.length]}</svg>
      </span>
      <span class="tr-index">0${i + 1}</span>
      <h3 class="tr-title">${title}</h3>
      <div class="tr-desc">${desc}</div>`;
    grid.append(card);
  });

  cardRows.forEach((r) => r.remove());
  block.append(grid);
  enhance(block);
}
