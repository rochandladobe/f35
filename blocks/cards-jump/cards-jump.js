import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-jump — "Learn More About F-35" related-content cards.
 * Each authored row is one card: cell 1 = image, cell 2 = title + description +
 * "Learn More" CTA (all linking to the same destination). Rendered as a 3-up
 * grid of fully-clickable cards, matching the source .jumpCard layout.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-jump-card-image';
      } else {
        div.className = 'cards-jump-card-body';
      }
    });

    // The card destination = the first link found in the body.
    const body = li.querySelector('.cards-jump-card-body');
    const dest = body ? body.querySelector('a[href]') : null;
    const href = dest ? dest.getAttribute('href') : null;

    if (body) {
      // Unwrap any <a> around the title/description text so the card text is
      // plain (the whole card becomes one link via the overlay below).
      body.querySelectorAll('p').forEach((p) => {
        const a = p.querySelector(':scope > a');
        if (a && a.textContent.trim() === p.textContent.trim()) {
          // classify: first text p = title, middle = description, last = CTA
          const text = a.textContent.trim();
          p.textContent = text;
        }
      });
      const paras = [...body.querySelectorAll('p')].filter((p) => p.textContent.trim());
      if (paras[0]) paras[0].className = 'cards-jump-card-title';
      if (paras.length > 2) {
        paras[paras.length - 1].className = 'cards-jump-card-cta';
        paras.slice(1, -1).forEach((p) => { p.className = 'cards-jump-card-desc'; });
      } else if (paras[1]) {
        paras[1].className = 'cards-jump-card-cta';
      }
    }

    // Make the whole card a single link (image + text) to the destination.
    if (href) {
      const link = document.createElement('a');
      link.className = 'cards-jump-card-link';
      link.setAttribute('href', href);
      while (li.firstChild) link.append(li.firstChild);
      li.append(link);
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });
  block.replaceChildren(ul);
}
