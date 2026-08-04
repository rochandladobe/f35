/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-masthead. Base block: hero.
 * Source: f35.com homepage masthead / banner block.
 * Structure (1 column): row1 = block name, row2 = background image (optional),
 * row3 = title (heading) + optional description + optional CTA.
 * Generated: 2026-07-30
 */
export default function parse(element, { document, url }) {
  // Background video (optional). Some mastheads (e.g. the UK page) use an
  // autoplay/muted/loop <video> background instead of a still image. Capture
  // its .mp4 source as a link so the block can rebuild the <video> and offer a
  // link out to the file. Absolute-ize a root-relative source against f35.com.
  let bgVideoUrl = null;
  const videoSource = element.querySelector('video source[src], video[src]');
  if (videoSource) {
    const raw = videoSource.getAttribute('src') || '';
    if (raw) {
      try {
        bgVideoUrl = new URL(raw, url || 'https://www.f35.com').href;
      } catch (e) {
        bgVideoUrl = raw;
      }
    }
  }

  // Background image (optional). Source masthead often uses a CSS background
  // set via an inline style="background-image:url(...)" rather than an <img>.
  // Capture an <img> if present; otherwise mine the inline background-image URL
  // from the block or any descendant and synthesize an <img> so the image is
  // carried into the block content.
  let bgImage = element.querySelector('img');
  if (!bgImage) {
    const styled = [element, ...element.querySelectorAll('[style]')]
      .find((el) => /background-image\s*:\s*url\(/i.test(el.getAttribute('style') || ''));
    if (styled) {
      const m = (styled.getAttribute('style') || '')
        .match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (m && m[1]) {
        const img = document.createElement('img');
        img.setAttribute('src', m[1].trim());
        img.setAttribute('alt', '');
        bgImage = img;
      }
    }
  }

  // Title — source uses a styled div (.bannerTitle) rather than a real heading.
  const titleEl = element.querySelector('h1, h2, .bannerTitle, [class*="Title"], [class*="title"]');

  // Description — the (desktop-only) intro paragraph beneath the title.
  // Fall back to a generic paragraph if the specific wrapper isn't present.
  const descEl = element.querySelector('.d-none.d-md-block, p, .bannerText, [class*="desc"]');

  // CTA link(s).
  const ctaLinks = Array.from(element.querySelectorAll('a.actionButton, a.button, a.cta'));

  // Build a heading from the title text so it renders as a Heading.
  let headingEl = null;
  if (titleEl) {
    const titleText = titleEl.textContent.trim();
    if (titleText) {
      headingEl = document.createElement('h1');
      headingEl.textContent = titleText;
    }
  }

  // Build a paragraph from the description text (avoid pulling in the title/CTA).
  let descriptionEl = null;
  if (descEl && descEl !== titleEl) {
    const descText = descEl.textContent.trim();
    if (descText) {
      descriptionEl = document.createElement('p');
      descriptionEl.textContent = descText;
    }
  }

  // Empty-block guard.
  if (!headingEl && !descriptionEl && ctaLinks.length === 0 && !bgVideoUrl && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: background media (optional). Prefer a video background; the block JS
  // rebuilds an autoplay/muted/loop <video> from this link and adds a link out
  // to the file. Fall back to a still image.
  if (bgVideoUrl) {
    const a = document.createElement('a');
    a.setAttribute('href', bgVideoUrl);
    a.textContent = bgVideoUrl;
    cells.push([a]);
  } else if (bgImage) {
    cells.push([bgImage]);
  }

  // Row: content — single cell holding heading, description, and CTA(s).
  const contentCell = [];
  if (headingEl) contentCell.push(headingEl);
  if (descriptionEl) contentCell.push(descriptionEl);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-masthead', cells });
  element.replaceWith(block);
}
