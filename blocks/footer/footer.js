import { getMetadata } from '../../scripts/aem.js';

/**
 * Fetches the footer fragment markup. Tries the footer metadata path (the
 * published fragment location) first, then falls back to the canonical content path.
 * @returns {Promise<{ html: string, base: string }|null>} markup and its base path
 */
async function fetchFooterFragment() {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const candidates = [`${footerPath}.plain.html`, '/content/footer.plain.html'];

  for (let i = 0; i < candidates.length; i += 1) {
    const url = candidates[i];
    try {
      // eslint-disable-next-line no-await-in-loop
      const resp = await fetch(url);
      if (resp.ok) {
        // eslint-disable-next-line no-await-in-loop
        const html = await resp.text();
        return { html, base: url };
      }
    } catch (e) {
      // try next candidate
    }
  }
  return null;
}

/**
 * Rewrites relative image sources so they resolve against the fragment base,
 * not the current page. e.g. images/logo.png -> /content/images/logo.png
 * @param {Element} container The parsed fragment container
 * @param {string} base The URL the fragment was loaded from
 */
function resolveRelativeImages(container, base) {
  const baseUrl = new URL(base, window.location);
  container.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.setAttribute('src', new URL(src, baseUrl).pathname);
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooterFragment();
  block.textContent = '';
  if (!fragment) return;

  const holder = document.createElement('div');
  holder.innerHTML = fragment.html;
  resolveRelativeImages(holder, fragment.base);

  // label the top-level sections: link columns + brand
  const sections = ['columns', 'brand'];
  sections.forEach((name, i) => {
    const section = holder.children[i];
    if (section) section.classList.add(`footer-${name}`);
  });

  // link columns: each top-level list item is a column with a heading + sublinks
  const columns = holder.querySelector('.footer-columns');
  if (columns) {
    columns.querySelectorAll(':scope > ul > li').forEach((li) => {
      li.classList.add('footer-column');
      const heading = li.querySelector(':scope > a');
      if (heading) heading.classList.add('footer-heading');
    });
  }

  // brand: identify the logo, social icon list, and legal links row
  const brand = holder.querySelector('.footer-brand');
  if (brand) {
    const logo = brand.querySelector('p:first-child');
    if (logo) logo.classList.add('footer-logo');
    const social = brand.querySelector('ul');
    if (social) social.classList.add('footer-social');
    const legal = brand.querySelector('p:last-child');
    if (legal && legal !== logo) legal.classList.add('footer-legal');
  }

  while (holder.firstElementChild) block.append(holder.firstElementChild);
}
