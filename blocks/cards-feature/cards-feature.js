import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-feature — icon + heading + bulleted-list feature columns.
 * Each authored row is one feature: cell 1 = icon image, cell 2 = a blue
 * heading + a bullet list. Rendered as a centered multi-column grid, matching
 * the source "Unrivaled Capabilities" feature groups.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-feature-card-icon';
      } else {
        div.className = 'cards-feature-card-body';
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]),
    );
  });
  block.replaceChildren(ul);
}
