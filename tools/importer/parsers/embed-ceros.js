/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-ceros. Base block: embed.
 * Source: f35.com Ceros interactive experiences — a positioned container with
 * `data-aspectRatio` wrapping an `<iframe class="ceros-experience"
 * src="//view.ceros.com/...">` (plus a scroll-proxy <script>). Follows the
 * Embed convention: 1 column. Row 1 = the experience URL (as a link); an
 * optional row 2 carries the desktop aspect ratio so the block can size the
 * responsive iframe. The scroll-proxy script wrapper is dropped.
 * Generated: 2026-08-04
 */
export default function parse(element, { document }) {
  // The Ceros iframe (or a fallback link to view.ceros.com).
  const iframe = element.querySelector('iframe.ceros-experience, iframe[src*="view.ceros.com"]');
  const link = element.querySelector('a[href*="view.ceros.com"]');
  let src = iframe ? iframe.getAttribute('src') : (link ? link.getAttribute('href') : '');

  // Empty-block guard: skip the scroll-proxy-only wrappers.
  if (!src || /scroll-proxy/.test(src)) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Normalize to an absolute https URL.
  if (src.startsWith('//')) src = `https:${src}`;

  // Desktop aspect ratio from the container's data-aspectRatio (fallback 1.8).
  const ratioHost = iframe ? (iframe.closest('[data-aspectratio], [data-aspectRatio]') || element)
    : element;
  const ratio = ratioHost.getAttribute('data-aspectRatio')
    || ratioHost.getAttribute('data-aspectratio') || '1.8';

  const a = document.createElement('a');
  a.setAttribute('href', src);
  a.textContent = src;

  const ratioCell = document.createElement('p');
  ratioCell.textContent = ratio;

  // 1 column, two rows: URL, then aspect ratio.
  const block = WebImporter.Blocks.createBlock(document, {
    name: 'embed-ceros',
    cells: [[a], [ratioCell]],
  });
  element.replaceWith(block);
}
