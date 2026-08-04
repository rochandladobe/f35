/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-video. Base block: embed (video).
 * Source: f35.com content-well "Pilot POV"-style video rows — one or more
 * `.cnt-video`/`.js-video` cells, each containing a YouTube (or Vimeo) iframe
 * whose `src`/`data-video-src` is the embed URL. Follows the Embed (video)
 * convention: 1 column, one row per video, each cell holding the video URL as
 * a link (the embed block builds the iframe).
 * Generated: 2026-08-04
 */
export default function parse(element, { document }) {
  // Prefer explicit video iframes (youtube/vimeo); include data-video-src cells.
  const frames = Array.from(element.querySelectorAll(
    'iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="vimeo"], iframe[data-video-src]',
  ));

  // Empty-block guard.
  if (frames.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  frames.forEach((frame) => {
    let src = frame.getAttribute('src') || frame.getAttribute('data-video-src') || '';
    // Normalize a YouTube embed URL to the canonical watch URL and drop the
    // duplicated `?rel=0`/`?si=` query artifacts from the source markup.
    const ytEmbed = src.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    const ytShort = src.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (ytEmbed) {
      src = `https://www.youtube.com/watch?v=${ytEmbed[1]}`;
    } else if (ytShort) {
      src = `https://www.youtube.com/watch?v=${ytShort[1]}`;
    }
    if (!src) return;

    const a = document.createElement('a');
    a.setAttribute('href', src);
    a.textContent = src;
    cells.push([a]);
  });

  // Empty-block guard (nothing extractable).
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });
  element.replaceWith(block);
}
