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
  }
}
