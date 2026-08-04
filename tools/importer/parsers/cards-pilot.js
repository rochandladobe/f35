/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-pilot. Base block: cards.
 * Source: f35.com "Meet the Pilots" roster. The pilots live in a two-column
 * Bootstrap grid (two `.col-lg-6` columns), each column holding a sequence of
 * `.image` (portrait) + `.article-top.text` (callsign h6 + bio/fun-fact
 * paragraphs) pairs. We flatten both columns into one ordered list of pilots
 * and emit one block row per pilot: cell1 = portrait image, cell2 = heading +
 * description paragraphs (matching the Cards convention: 2 columns, image in
 * the first cell, title + description text in the second).
 * Generated: 2026-08-04
 */
export default function parse(element, { document }) {
  // Collect portrait images in document order across both grid columns.
  const images = Array.from(element.querySelectorAll('.image img, img'))
    .filter((img) => /pilot/i.test(img.getAttribute('src') || '') || img.closest('.image'));

  // Empty-block guard.
  if (images.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  images.forEach((img) => {
    // The pilot's text block is the .article-top/.text wrapper that follows the
    // image's .image container (they are siblings within the column).
    const imageWrap = img.closest('.image') || img.parentElement;
    let textWrap = imageWrap ? imageWrap.nextElementSibling : null;
    // Skip over any empty spacer between image and text.
    while (textWrap && !textWrap.textContent.trim()
      && !textWrap.querySelector('h1,h2,h3,h4,h5,h6,p')) {
      textWrap = textWrap.nextElementSibling;
    }

    const imgCell = document.createElement('p');
    const pic = document.createElement('picture');
    const cleanImg = document.createElement('img');
    cleanImg.setAttribute('src', img.getAttribute('src'));
    cleanImg.setAttribute('alt', img.getAttribute('alt') || '');
    pic.append(cleanImg);
    imgCell.append(pic);

    const bodyCell = [];
    if (textWrap) {
      const heading = textWrap.querySelector('h1,h2,h3,h4,h5,h6');
      if (heading) {
        const h = document.createElement('h6');
        h.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
        bodyCell.push(h);
      }
      textWrap.querySelectorAll('p').forEach((p) => {
        if (!p.textContent.trim()) return;
        // Preserve inline markup (e.g. superscript "4th"); otherwise plain text.
        const np = document.createElement('p');
        np.innerHTML = p.innerHTML;
        bodyCell.push(np);
      });
    }

    cells.push([imgCell, bodyCell.length ? bodyCell : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-pilot', cells });
  element.replaceWith(block);
}
