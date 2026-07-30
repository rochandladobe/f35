/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-video-broll. Base block: embed.
 * Source: f35.com media kit "B-Roll" video grid — repeating Vimeo iframe players,
 * each with an optional download link.
 * Structure: 1 column. Each video is its own content row whose single cell holds
 * the Vimeo player URL (as a link) plus the optional download link.
 * Generated: 2026-07-30
 */
export default function parse(element, { document }) {
  // Each video lives in its own grid cell containing a Vimeo iframe.
  let videoCells = Array.from(element.querySelectorAll('[class*="col-lg-4"]'))
    .filter((el) => el.querySelector('iframe[src*="vimeo"]'));

  // Fallback: derive from iframes directly.
  if (videoCells.length === 0) {
    videoCells = Array.from(element.querySelectorAll('iframe[src*="vimeo"]'))
      .map((f) => f.closest('[class*="col-"]') || f.parentElement)
      .filter((el, i, arr) => el && arr.indexOf(el) === i);
  }

  // Empty-block guard.
  if (videoCells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  videoCells.forEach((cell) => {
    const iframe = cell.querySelector('iframe[src*="vimeo"], iframe');
    const src = iframe ? iframe.getAttribute('src') : null;

    // Optional download link (e.g. "Download F-35A B-Roll").
    const downloadLink = cell.querySelector('.cnt_paragraph a[href], a[href*="vimeo.com/"]');

    const contentCell = [];

    // Video embed URL as a link (embed block expects a URL/link in the cell).
    if (src) {
      const a = document.createElement('a');
      a.setAttribute('href', src);
      a.textContent = src;
      contentCell.push(a);
    }

    // Download link below the video.
    if (downloadLink && downloadLink.getAttribute('href') && downloadLink.getAttribute('href') !== src) {
      const dl = document.createElement('a');
      dl.setAttribute('href', downloadLink.getAttribute('href'));
      dl.textContent = downloadLink.textContent.replace(/\s+/g, ' ').trim() || 'Download';
      contentCell.push(dl);
    }

    if (contentCell.length > 0) {
      cells.push([contentCell]);
    }
  });

  // Empty-block guard (nothing extractable).
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video-broll', cells });
  element.replaceWith(block);
}
