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
  // A milestone is an image (.image) paired with its caption (.cnt_paragraph).
  // A single grid column often packs SEVERAL such pairs, so iterate the images
  // directly and pair each with the nearest following caption — this captures
  // every milestone regardless of how many share a column. Each pairing yields
  // one { image, paragraph } item.
  const captionSel = '.cnt_paragraph';
  let items = Array.from(element.querySelectorAll('.image')).map((imageWrap) => {
    // Walk forward through siblings (and out to the column) to find the caption
    // that belongs to this image.
    let cur = imageWrap.nextElementSibling;
    let caption = null;
    while (cur) {
      if (cur.matches(captionSel)) { caption = cur; break; }
      const nested = cur.querySelector(captionSel);
      if (nested) { caption = nested; break; }
      if (cur.querySelector('.image')) break; // reached the next milestone
      cur = cur.nextElementSibling;
    }
    return { image: imageWrap.querySelector('img'), paragraph: caption };
  }).filter((it) => it.image);

  // Fallback: derive items straight from caption wrappers if no .image markers.
  if (items.length === 0) {
    items = Array.from(element.querySelectorAll(captionSel)).map((p) => {
      const col = p.closest('[class*="col-"]') || p.parentElement;
      return { image: col ? col.querySelector('img') : null, paragraph: p };
    });
  }

  // Empty-block guard.
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    const image = item.image;
    const paragraph = item.paragraph;

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
