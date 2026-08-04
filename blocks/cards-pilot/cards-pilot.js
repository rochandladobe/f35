import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-pilot — F-35 test-pilot roster.
 * Each authored row is one pilot: cell 1 = portrait, cell 2 = callsign heading
 * + experience + fun-fact paragraphs. Rendered as a responsive card grid
 * (photo on top, text below), matching the source "Meet the Pilots" layout.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-pilot-card-image';
      } else {
        div.className = 'cards-pilot-card-body';
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]),
    );
  });
  block.replaceChildren(ul);
}
