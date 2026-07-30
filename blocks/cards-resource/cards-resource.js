import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the resource cards block
 * Each row becomes a card: first cell = icon/banner, remaining cells = body (title + CTA).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((cell, i) => {
      // First cell is the icon/banner (may be empty when the source used a glyph icon),
      // everything after it is the card body (title + download CTA).
      cell.className = i === 0 ? 'cards-resource-card-image' : 'cards-resource-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
