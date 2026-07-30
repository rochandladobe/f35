/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-resource. Base block: cards.
 * Source: f35.com media kit download cards (.mediaCard).
 * Each card: banner icon/image + title + download CTA. The whole card is wrapped
 * in an <a> pointing to the asset (some cards have the download link nested inside
 * the "read more" text instead).
 * Structure: 2 columns — cell1 = icon image, cell2 = title (heading) + download link.
 * Generated: 2026-07-30
 */
export default function parse(element, { document }) {
  const cardEls = Array.from(element.querySelectorAll('.mediaCard'));

  // Empty-block guard.
  if (cardEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cardEls.forEach((card) => {
    const image = card.querySelector('.mediaCardBanner img, img');
    const titleEl = card.querySelector('.mediaCardTitle, [class*="Title"]');
    const readMoreEl = card.querySelector('.mediaCardReadMore, [class*="ReadMore"]');

    // Determine the asset href: prefer the card's own wrapping anchor, else any
    // link inside the read-more element.
    let href = null;
    const outerLink = card.querySelector(':scope > a[href], a[href]');
    if (outerLink) href = outerLink.getAttribute('href');
    if (readMoreEl) {
      const innerLink = readMoreEl.querySelector('a[href]');
      if (innerLink) href = innerLink.getAttribute('href');
    }

    const contentCell = [];

    // Title as heading.
    if (titleEl) {
      const t = titleEl.textContent.replace(/\s+/g, ' ').trim();
      if (t) {
        const h = document.createElement('h3');
        h.textContent = t;
        contentCell.push(h);
      }
    }

    // Download / access CTA.
    const ctaText = (readMoreEl && readMoreEl.textContent.replace(/\s+/g, ' ').trim()) || 'Download';
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = ctaText;
      contentCell.push(a);
    }

    cells.push([image || '', contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-resource', cells });
  element.replaceWith(block);
}
