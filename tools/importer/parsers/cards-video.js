/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-video. Base block: cards.
 * Source: f35.com "F-35 Capabilities" YouTube Shorts grid — each column holds a
 * `.youtube-shorts .video-placeholder[data-video-id]` with a caption
 * (`p.top-left`) and a poster thumbnail. Follows the Cards convention: 2
 * columns per row — cell1 = poster image (the YouTube thumbnail), cell2 =
 * caption + the video link (as the CTA). The block renders click-to-play cards.
 * Generated: 2026-08-04
 */
export default function parse(element, { document }) {
  const placeholders = Array.from(element.querySelectorAll('.video-placeholder[data-video-id]'));

  // Empty-block guard.
  if (placeholders.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  placeholders.forEach((ph) => {
    const id = ph.getAttribute('data-video-id');
    if (!id) return;
    const captionEl = ph.querySelector('.top-left, p');
    const caption = captionEl ? captionEl.textContent.replace(/\s+/g, ' ').trim() : '';

    // Cell 1: poster thumbnail image (YouTube maxres still).
    const imgCell = document.createElement('p');
    const pic = document.createElement('picture');
    const img = document.createElement('img');
    img.setAttribute('src', `https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
    img.setAttribute('alt', caption || 'Video');
    pic.append(img);
    imgCell.append(pic);

    // Cell 2: caption + the video link (CTA).
    const body = [];
    if (caption) {
      const cap = document.createElement('p');
      cap.textContent = caption;
      body.push(cap);
    }
    const a = document.createElement('a');
    a.setAttribute('href', `https://www.youtube.com/watch?v=${id}`);
    a.textContent = `https://www.youtube.com/watch?v=${id}`;
    body.push(a);

    cells.push([imgCell, body]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-video', cells });
  element.replaceWith(block);
}
