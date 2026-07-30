/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-social. Base block: carousel.
 * Source: f35.com homepage social media carousel.
 * Each slide: preview image + platform icon + "Follow us on {platform}" title,
 * the whole card wrapped in a profile link.
 * Structure: 2 columns — cell1 = preview image, cell2 = title + follow CTA.
 * Generated: 2026-07-30
 */
export default function parse(element, { document }) {
  const cardEls = Array.from(element.querySelectorAll('.homeNewsCard.inCarousel, .homeNewsCard.socialFixedHeight'));

  // Empty-block guard.
  if (cardEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  const seenHrefs = new Set();

  cardEls.forEach((card) => {
    // Profile link wrapping the card.
    const link = card.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;

    // Bootstrap multi-item carousels duplicate slides in the DOM for smooth
    // looping. Dedupe by profile href so the imported carousel has unique slides.
    if (href) {
      if (seenHrefs.has(href)) return;
      seenHrefs.add(href);
    }

    // Preview image (first cell, no other content per library convention).
    const previewImg = card.querySelector('.homeNewsImage img, img');

    // Title, e.g. "Follow us on X".
    const titleEl = card.querySelector('.homeNewsArticleTitle, [class*="ArticleTitle"], h1, h2, h3, h4, h5, h6');

    const contentCell = [];

    // Title as heading.
    if (titleEl) {
      const t = titleEl.textContent.trim().replace(/\s+/g, ' ');
      if (t) {
        const h = document.createElement('h3');
        h.textContent = t;
        contentCell.push(h);
      }
    }

    // Follow CTA pointing at the profile link.
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      const titleText = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : '';
      a.textContent = titleText || 'Follow us';
      contentCell.push(a);
    }

    cells.push([previewImg || '', contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-social', cells });
  element.replaceWith(block);
}
