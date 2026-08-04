/*
 * Embed (Ceros) Block
 * Renders a responsive Ceros interactive experience. Authored (1 column) as
 * the Ceros experience URL in the first row; an optional second row carries the
 * desktop aspect ratio (e.g. "1.8"). The iframe is lazy-loaded on scroll.
 *
 *   | embed-ceros |
 *   | https://view.ceros.com/lockheed-martin/f-35-variants |
 *   | 1.8 |
 */

const loadCeros = (wrapper, src) => {
  if (wrapper.dataset.embedLoaded === 'true') return;
  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', src);
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('title', 'Interactive experience');
  iframe.className = 'embed-ceros-iframe';
  wrapper.append(iframe);
  wrapper.dataset.embedLoaded = 'true';
};

export default function decorate(block) {
  const link = block.querySelector('a[href]');
  if (!link) return;

  let src = link.getAttribute('href');
  // Protocol-relative or bare view.ceros.com → https.
  if (src.startsWith('//')) src = `https:${src}`;

  // Optional aspect ratio in the last row (width ÷ height, e.g. 1.8) — the row
  // that holds no link.
  const rows = [...block.querySelectorAll(':scope > div')];
  const ratioRow = rows.reverse().find((r) => !r.querySelector('a') && r.textContent.trim());
  const ratio = ratioRow ? parseFloat(ratioRow.textContent.trim()) : NaN;

  const wrapper = document.createElement('div');
  wrapper.className = 'embed-ceros-frame';
  // Default to 16:9 (1.778) when no ratio is authored.
  wrapper.style.setProperty('--ceros-aspect', ratio && ratio > 0 ? `${ratio}` : '1.778');

  block.replaceChildren(wrapper);

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadCeros(wrapper, src);
    }
  });
  observer.observe(wrapper);
}
