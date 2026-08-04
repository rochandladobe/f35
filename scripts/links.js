/**
 * Normalizes internal links so they resolve on Edge Delivery.
 *
 * The authored/imported content links to `.html` paths, sometimes with
 * mixed-case or underscored segments (e.g. /f35/about/Meet-The-Pilots.html or
 * .../first_polish_f-35_built_at_cameris_faco_has_flown.html), and some links
 * still point at the old absolute host (https://www.f35.com/...). Edge Delivery
 * serves pages extensionless, lowercased, with hyphenated segments and the
 * homepage at its folder root — so without normalization these links 404.
 *
 * Rules:
 *  - Skip in-page anchors, mailto:, tel:.
 *  - Rewrite same-origin links and old-site (f35.com) absolute links; the
 *    latter become relative. Genuinely external links (e.g. lockheedmartin.com,
 *    social networks) are left untouched.
 *  - Skip /fragments/ references (handled by auto-blocking).
 *  - Strip the .html extension, lowercase the path, convert underscores to
 *    hyphens, and collapse a trailing /index to the folder root.
 *
 * @param {Element} container The element whose descendant links to normalize
 */
// eslint-disable-next-line import/prefer-default-export
export function normalizeInternalLinks(container) {
  container.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || /^(#|mailto:|tel:)/i.test(href)) return;

    let url;
    try {
      url = new URL(href, window.location.href);
    } catch (e) {
      return; // leave malformed hrefs untouched
    }

    const isOldSite = /(^|\.)f35\.com$/i.test(url.hostname);
    const isSameOrigin = url.origin === window.location.origin;
    if (!isSameOrigin && !isOldSite) return; // truly external — leave alone
    if (url.pathname.includes('/fragments/')) return;

    // Skip media/asset files (video, images, docs). Only page routes are
    // extensionless + lowercased; an asset path (e.g. a .mp4 masthead video or
    // a .pdf) must keep its exact case and extension to remain reachable.
    const ext = (url.pathname.match(/\.([a-z0-9]+)$/i) || [])[1];
    if (ext && !/^html?$/i.test(ext)) return;

    let path = url.pathname
      .replace(/\.html$/i, '')
      .toLowerCase()
      .replace(/_/g, '-')
      .replace(/\/index$/, '/');
    if (path === '') path = '/';

    a.setAttribute('href', `${path}${url.search}${url.hash}`);
  });
}
