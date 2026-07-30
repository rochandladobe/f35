/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news. Base block: cards.
 * Source: f35.com homepage "News & Features" teaser grid.
 * Each card: image + date + title + description + "Read More" link (whole card wrapped in an <a>).
 * Structure: 2 columns — cell1 = image, cell2 = date/title/description/CTA.
 * Generated: 2026-07-30
 */
export default function parse(element, { document }) {
  const cardEls = Array.from(element.querySelectorAll('.homeNewsCard'));

  // Empty-block guard.
  if (cardEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cardEls.forEach((card) => {
    // The whole card is wrapped in an anchor pointing to the article.
    const link = card.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;

    const image = card.querySelector('.homeNewsImage img, img');
    const dateEl = card.querySelector('.homeNewsTagName, [class*="TagName"]');
    const titleEl = card.querySelector('.homeNewsArticleTitle, [class*="ArticleTitle"], h2, h3');
    const descEl = card.querySelector('.homeNewsArticleDescription, [class*="Description"]');
    const readMoreEl = card.querySelector('.homeNewsReadMore, [class*="ReadMore"]');

    const contentCell = [];

    // Date.
    if (dateEl) {
      const t = dateEl.textContent.trim();
      if (t) {
        const p = document.createElement('p');
        p.textContent = t;
        contentCell.push(p);
      }
    }

    // Title as heading.
    if (titleEl) {
      const t = titleEl.textContent.trim();
      if (t) {
        const h = document.createElement('h3');
        h.textContent = t;
        contentCell.push(h);
      }
    }

    // Description.
    if (descEl) {
      const t = descEl.textContent.trim();
      if (t) {
        const p = document.createElement('p');
        p.textContent = t;
        contentCell.push(p);
      }
    }

    // "Read More" CTA — build a real link using the card href.
    const readMoreText = (readMoreEl && readMoreEl.textContent.trim()) || 'Read More';
    if (href) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = readMoreText;
      contentCell.push(a);
    }

    cells.push([image || '', contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
