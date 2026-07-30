/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-specs. Base block: cards.
 * Source: f35.com borderless 3-up spec/stat icon tiles.
 * These are image-only icon tiles — each label is baked into the image, so there
 * is no separate text content. Each icon becomes its own single-cell card row.
 * The matched element is a single English-tab .column with no .cnt_paragraph (icon-only).
 * Generated: 2026-07-30
 */
export default function parse(element, { document }) {
  // Each tile is an .image wrapper containing a single icon <img>.
  let images = Array.from(element.querySelectorAll('.image img, .float-none img'));

  // Fallback: any images directly inside the block.
  if (images.length === 0) {
    images = Array.from(element.querySelectorAll('img'));
  }

  // Empty-block guard.
  if (images.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One image per card row (single column: image with baked-in label).
  const cells = images.map((img) => [img]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-specs', cells });
  element.replaceWith(block);
}
