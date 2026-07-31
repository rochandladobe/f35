/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: f35.com site-wide cleanup.
 *
 * Removes non-authorable site chrome (header/nav, footer, cookie banner, search UI,
 * tracking pixel) so the import contains only page-level authorable content.
 *
 * All selectors verified against the captured DOM in the migration-work cleaned.html
 * files (homepage, partner-country, partner-country-variant, media-kit, news-article).
 *
 * NOTE: We intentionally do NOT blanket-remove <iframe>. The media-kit template
 * contains authorable Vimeo video iframes (<iframe id="video" ...>) that the embed
 * parser needs. Only the non-authorable TTD tracking pixel iframe is removed by id.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent banner (found: <div id="cookie-bar">) — remove before parsing
    // so it can't interfere with block matching.
    WebImporter.DOMUtils.remove(element, [
      '#cookie-bar',
    ]);

    // Search UI overlays/widgets (found across all templates):
    //   <... id="lm-search">, <... id="nav-search-trigger">,
    //   <... id="nav-search-bar-container">, autocomplete widget ids.
    WebImporter.DOMUtils.remove(element, [
      '#lm-search',
      '#nav-search-trigger',
      '#nav-search-bar-container',
      '[id^="nav-search"]',
      '#autocomplete',
      '[id^="autocomplete-"]',
    ]);

    // Homepage "News & Features" (#homeSectionThree) and "Follow Us on Social
    // Media" (#homeSectionFive) each pair an intro column — a styled
    // .sectionTitle <div> + a .homeSectionNewsFillerText <div> — beside a
    // card/carousel block. Those blocks are scoped to just the card wrapper, so
    // the intro stays as default content; but the <div>s don't convert to clean
    // markdown. Promote the title <div> to an <h2> and the filler <div> to a <p>
    // in BOTH sections so each imports as a proper heading + paragraph.
    ['#homeSectionThree', '#homeSectionFive'].forEach((sectionId) => {
      const title = element.querySelector(`${sectionId} .sectionTitle`);
      if (title) {
        const h = element.ownerDocument.createElement('h2');
        h.textContent = title.textContent.trim();
        title.replaceWith(h);
      }
      const filler = element.querySelector(`${sectionId} .homeSectionNewsFillerText`);
      if (filler) {
        const p = element.ownerDocument.createElement('p');
        p.textContent = filler.textContent.trim();
        filler.replaceWith(p);
      }
    });

    // The source social section (#homeSectionFive) ships Bootstrap carousel
    // controls — prev/next anchors linking to #carousel-example-multi and an
    // <ol> of indicator <li>s. Our carousel-social block builds its own controls
    // and indicators, so remove the source ones (they otherwise import as stray
    // empty SVG links and a bare numbered list below the carousel).
    element.querySelectorAll('#homeSectionFive [href*="carousel-example"], #homeSectionFive [data-slide], #homeSectionFive [data-bs-slide]')
      .forEach((el) => (el.closest('a, p') || el).remove());
    element.querySelectorAll('#homeSectionFive .carousel-indicators, #homeSectionFive ol')
      .forEach((el) => el.remove());

    // Homepage "Fast Facts" promo band (.bg-grad, not #homeSectionTwo) is a
    // columns-promo with a styled .sectionTitle <div> ("Fast Facts") and a
    // supporting <div> ("Program Status and Recent Milestones at a Glance").
    // Promote them to <h2>/<p> so the columns-promo parser captures a proper
    // heading + paragraph alongside the carrier photo and Learn More CTA.
    const fastFactsBand = [...element.querySelectorAll('.bg-grad')]
      .find((el) => el.id !== 'homeSectionTwo' && /Fast Facts/i.test(el.textContent || ''));
    if (fastFactsBand) {
      const ffTitle = fastFactsBand.querySelector('.sectionTitle');
      if (ffTitle) {
        const h = element.ownerDocument.createElement('h2');
        h.textContent = ffTitle.textContent.trim();
        ffTitle.replaceWith(h);
      }
      // The support line is the sibling div right after the (now) heading.
      const heading = fastFactsBand.querySelector('h2');
      if (heading && heading.nextElementSibling
        && heading.nextElementSibling.tagName === 'DIV'
        && heading.nextElementSibling.children.length === 0
        && heading.nextElementSibling.textContent.trim()) {
        const p = element.ownerDocument.createElement('p');
        p.textContent = heading.nextElementSibling.textContent.trim();
        heading.nextElementSibling.replaceWith(p);
      }
    }

    // Decorative background "wing" graphics (bgWingTop/bgWingBottom) and the
    // Fast Facts silhouette icon are pure CSS decoration on the source — applied
    // as inline `background-image` (or lazy data-src), NOT authored <img>. Left
    // in place, WebImporter.rules.transformBackgroundImages later converts them
    // into real <img> tags that render as empty spacer bands. Remove the styled
    // carrier elements up-front (in beforeTransform, before that conversion runs)
    // by matching the background-image URL in the style/data attributes.
    // Only remove the specific empty carrier <div>s whose inline background-image
    // is a decorative wing/silhouette graphic. These are childless spacer divs —
    // guard on that so we never remove a content-bearing ancestor.
    element.querySelectorAll('[style*="bgWing"],[style*="homeFastFactsIcon"],[style*="TopClear"]')
      .forEach((el) => {
        if (el.children.length === 0 && !el.textContent.trim()) el.remove();
      });

    // Some wing graphics are authored as standalone decorative <img> (e.g.
    // bgWingTop.png before the News heading). They carry no content and render
    // as empty bands — remove the image and its wrapping <p>/<picture>.
    element.querySelectorAll('img[src*="bgWing"], img[src*="homeFastFactsIcon"], img[src*="TopClear"], img[src*="bgWingBottom"]')
      .forEach((img) => (img.closest('p, picture') || img).remove());

    // Global Enterprise partner-country pages ship the same content in multiple
    // languages: a visible <div id="English" class="language-block"> plus hidden
    // <div class="language-block d-none"> variants (Dutch, French, ...) toggled by
    // a Select Language dropdown. We migrate only the primary (English) content;
    // remove every hidden language variant AND the language switcher so translated
    // duplicates and the non-authorable control don't leak into the import.
    WebImporter.DOMUtils.remove(element, [
      '.language-block.d-none',
      '.language-selector',
      '.selectLanguage',
      'select.form-control',
    ]);

    // Screen-reader-only page title (e.g. <h1 class="sr-only sr-only-focusable">
    // F-35 Lightning II</h1>). It's visually hidden on the source via the sr-only
    // utility but has no such class in EDS, so it would render as a stray visible
    // heading at the top of the page. Remove it — the document title is preserved
    // in page metadata.
    WebImporter.DOMUtils.remove(element, [
      '.sr-only',
      '.sr-only-focusable',
      '.visually-hidden',
    ]);

    // Non-authorable analytics/tracking pixels emitted as bare anchors/images
    // (e.g. <a href="about:blank">_hjSafeContext</a>, LinkedIn/Twitter/Facebook
    // tracking-pixel <img> beacons). These carry no content value.
    WebImporter.DOMUtils.remove(element, [
      'a[href="about:blank"]',
      'img[src*="px.ads.linkedin.com"]',
      'img[src*="facebook.com/tr"]',
      'img[src*="analytics.twitter.com"]',
      'img[src*="t.co/i/adsct"]',
      'img[src*="insight.adsrvr.org"]',
      'img[src*="match.adsrvr.org"]',
      'img[src*="doubleclick.net"]',
    ]);

    // Hidden/duplicate CTAs that point nowhere (href="#") — e.g. the mobile-only
    // "Go to News" link that duplicates the visible "Go To News" default-content
    // CTA. Remove empty-fragment anchors so they don't create stray links.
    element.querySelectorAll('a[href="#"]').forEach((a) => {
      const li = a.closest('li');
      (li || a).remove();
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome. These are auto-populated by the EDS header/footer
    // blocks and must not appear in imported page content.
    //   Header + both navs: <header id="f35-header"> contains the desktop
    //     <nav class="tw:hidden tw:lg:flex"> and <nav id="mobile-nav"> (verified
    //     both navs are nested inside #f35-header), plus all #mobile-nav-* triggers.
    //   Footer: <footer id="footerContent"> and <... id="footerFootnotes">.
    WebImporter.DOMUtils.remove(element, [
      '#f35-header',
      '#mobile-nav',
      '[id^="mobile-nav"]',
      '#footerContent',
      '#footerFootnotes',
    ]);

    // Non-authorable tracking pixel (found: <iframe id="universal_pixel_ukr5wva"
    // src="https://insight.adsrvr.org/..." title="TTD Universal Pixel">).
    // Removed by id only — authorable Vimeo <iframe id="video"> embeds are preserved.
    WebImporter.DOMUtils.remove(element, [
      '#universal_pixel_ukr5wva',
    ]);

    // Hotjar/analytics safe-context anchor (<a href="about:blank">_hjSafeContext</a>)
    // is injected by third-party JS at runtime, so it isn't present at
    // beforeTransform — remove it here (and its emptied wrapping <p>).
    element.querySelectorAll('a[href="about:blank"]').forEach((a) => {
      const para = a.closest('p');
      a.remove();
      if (para && !para.textContent.trim() && !para.querySelector('img, picture, iframe')) {
        para.remove();
      }
    });

    // NOTE: decorative wing/silhouette backgrounds that WebImporter materializes
    // into <img> via transformBackgroundImages are stripped in the import script
    // AFTER that rule runs (this hook fires before it), so no removal here.
  }
}
