/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-milestone. Base block: cards.
 * Source: f35.com partner-country milestone grid.
 * Each item: image + a bold year + description text (inside .cnt_paragraph).
 * The matched element is an English-tab .column containing several .col-* card items.
 * Structure: 2 columns — cell1 = image, cell2 = year (heading) + description.
 * Generated: 2026-07-30
 */
export default function parse(element, { document }) {
  // Each milestone card is a grid column that holds an image and a paragraph.
  let items = Array.from(element.querySelectorAll(':scope > .row > [class*="col-"], [class*="col-"]'))
    .filter((el) => el.querySelector('.image img, img') && el.querySelector('.cnt_paragraph'));

  // Fallback: derive items from paragraph wrappers if the column layout differs.
  if (items.length === 0) {
    items = Array.from(element.querySelectorAll('.cnt_paragraph'))
      .map((p) => p.closest('[class*="col-"]'))
      .filter((el, i, arr) => el && arr.indexOf(el) === i);
  }

  // Empty-block guard.
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    const image = item.querySelector('.image img, img');
    const paragraph = item.querySelector('.cnt_paragraph');

    const contentCell = [];

    if (paragraph) {
      // The year is the leading bold text; the rest is the description.
      const yearEl = paragraph.querySelector('b, strong');
      const yearText = yearEl ? yearEl.textContent.replace(/\s+/g, ' ').replace(/:\s*$/, '').trim() : '';
      const fullText = paragraph.textContent.replace(/\s+/g, ' ').trim();

      if (yearText) {
        const h = document.createElement('h3');
        h.textContent = yearText.replace(/:$/, '');
        contentCell.push(h);
      }

      // Description = paragraph text minus the leading year label.
      let descText = fullText;
      if (yearEl) {
        const yLabel = yearEl.textContent.replace(/\s+/g, ' ').trim();
        if (descText.startsWith(yLabel)) {
          descText = descText.slice(yLabel.length).trim();
        }
      }
      descText = descText.replace(/^:\s*/, '').trim();
      if (descText) {
        const p = document.createElement('p');
        p.textContent = descText;
        contentCell.push(p);
      }
    }

    cells.push([image || '', contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-milestone', cells });
  element.replaceWith(block);
}
