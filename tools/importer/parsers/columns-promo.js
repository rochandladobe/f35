/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-promo. Base block: columns.
 * Source: f35.com homepage two-column promo band (image column + text column).
 * Structure: row1 = block name, row2 = 2 cells (left: image, right: heading/paragraph/CTA).
 * Generated: 2026-07-30
 */
export default function parse(element, { document }) {
  // Image column.
  const image = element.querySelector('img');

  // Text column pieces.
  const titleEl = element.querySelector('.sectionTitle, h1, h2, h3, [class*="Title"]');
  const teaserEl = element.querySelector('.homeAboutTeaserText, p, [class*="Teaser"], [class*="teaser"]');
  const ctaLinks = Array.from(element.querySelectorAll('a.actionButton, a.button, a.cta'));

  // Build a real heading from the section title text.
  let headingEl = null;
  if (titleEl) {
    const t = titleEl.textContent.trim();
    if (t) {
      headingEl = document.createElement('h2');
      headingEl.textContent = t;
    }
  }

  // Build a paragraph from the teaser text.
  let paragraphEl = null;
  if (teaserEl && teaserEl !== titleEl) {
    const t = teaserEl.textContent.trim();
    if (t) {
      paragraphEl = document.createElement('p');
      paragraphEl.textContent = t;
    }
  }

  // Empty-block guard.
  if (!image && !headingEl && !paragraphEl && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Left cell: image. Right cell: text content.
  const leftCell = [];
  if (image) leftCell.push(image);

  const rightCell = [];
  if (headingEl) rightCell.push(headingEl);
  if (paragraphEl) rightCell.push(paragraphEl);
  rightCell.push(...ctaLinks);

  const cells = [];
  cells.push([leftCell, rightCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
