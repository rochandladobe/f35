import { enhance } from '../../scripts/scroll-fx.js';

/*
 * future-ready — "Future Ready" (Section 8).
 * Optional first row with a <picture> → parallax background photo.
 * Content row: eyebrow (p), headline (h2), copy (p), optional CTA (p > a).
 */

export default function decorate(block) {
  const bgPicture = block.querySelector(':scope > div picture');
  const bgRow = bgPicture ? bgPicture.closest(':scope > div') : null;
  const contentRow = block.querySelector(':scope > div:has(h1, h2)')
    || [...block.children].pop();

  const bg = document.createElement('div');
  bg.className = 'fr-bg';
  bg.setAttribute('aria-hidden', 'true');
  bg.innerHTML = `
    <div class="fr-glow"></div>
    <div class="fr-streaks" data-parallax="0.14"></div>`;
  if (bgRow) {
    bgRow.classList.add('fr-photo');
    bgRow.setAttribute('data-parallax', '0.12');
    bg.prepend(bgRow);
  }

  const content = document.createElement('div');
  content.className = 'fr-content';
  content.setAttribute('data-reveal', '');
  if (contentRow) {
    const cell = contentRow.firstElementChild || contentRow;
    const eyebrow = cell.querySelector('p:first-child');
    if (eyebrow && !eyebrow.querySelector('a')) eyebrow.classList.add('fx-eyebrow');
    const cta = cell.querySelector('p a');
    if (cta) {
      cta.classList.add('button', 'accent');
      cta.closest('p').classList.add('fr-cta');
    }
    while (cell.firstChild) content.append(cell.firstChild);
  }

  block.textContent = '';
  block.append(bg, content);
  enhance(block);
}
