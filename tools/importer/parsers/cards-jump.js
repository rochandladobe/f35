/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-jump. Base block: cards.
 * Source: f35.com "Learn More About F-35" related-content cards. Each card is
 * a `.jumpCard` <a> wrapping `.jumpImage` (thumbnail), `.jumpArticleTitle`,
 * `.jumpArticleDescription`, and an `.actionButton` ("Learn More"), all linking
 * to the same destination. Follows the Cards convention: 2 columns per row —
 * image in cell 1, title + description + CTA in cell 2.
 * Generated: 2026-08-04
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.jumpCard'));

  // Empty-block guard.
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    const linkEl = card.matches('a[href]') ? card : card.querySelector('a[href]');
    const href = linkEl ? linkEl.getAttribute('href') : '';
    const img = card.querySelector('.jumpImage img, img');
    const title = card.querySelector('.jumpArticleTitle');
    const desc = card.querySelector('.jumpArticleDescription');
    const cta = card.querySelector('.actionButton');

    // Image cell.
    let imgCell = '';
    if (img) {
      const p = document.createElement('p');
      const pic = document.createElement('picture');
      const clean = document.createElement('img');
      clean.setAttribute('src', img.getAttribute('src'));
      clean.setAttribute('alt', img.getAttribute('alt') || (title ? title.textContent.trim() : ''));
      pic.append(clean);
      p.append(pic);
      imgCell = p;
    }

    // Body cell: title, description, CTA — each a link to the destination so
    // the block JS can turn the whole card into one clickable link.
    const body = [];
    const mkLink = (text) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = text;
      p.append(a);
      return p;
    };
    if (title && title.textContent.trim()) body.push(mkLink(title.textContent.trim()));
    if (desc && desc.textContent.trim()) body.push(mkLink(desc.textContent.trim()));
    body.push(mkLink(cta && cta.textContent.trim() ? cta.textContent.trim() : 'Learn More'));

    cells.push([imgCell, body]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-jump', cells });
  element.replaceWith(block);
}
