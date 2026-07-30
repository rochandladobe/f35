/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: f35.com section breaks and section metadata.
 *
 * Adds an <hr> section break before every non-first section defined in the
 * template, and a "Section Metadata" block for any section that declares a
 * `style`. Driven entirely by payload.template.sections, so it works for every
 * f35 template (homepage: 5 sections, content-page / partner-country /
 * partner-country-variant / news-article: 2 sections; media-kit has 1 and
 * therefore gets no breaks).
 *
 * Section selectors come from tools/importer/page-templates.json (verified against
 * the captured DOM). A selector may be a string or an array of fallback selectors
 * (partner-country templates use ["#English .content-well", ".content-well"]).
 *
 * Runs in afterTransform only.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

/**
 * Resolve a section to its first matching element in the DOM.
 * Accepts a string selector or an array of fallback selectors.
 */
function resolveSectionElement(root, selector) {
  if (!selector) return null;
  const selectors = Array.isArray(selector) ? selector : [selector];
  for (const sel of selectors) {
    if (!sel) continue;
    let el = null;
    try {
      el = root.querySelector(sel);
    } catch (e) {
      el = null;
    }
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const sections = (payload && payload.template && payload.template.sections) || [];
    if (sections.length < 2) return;

    const doc = (payload && payload.document) || (element.ownerDocument);

    // Process in reverse so DOM insertions don't shift the positions of
    // sections we have not handled yet.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = resolveSectionElement(element, section.selector);
      if (!sectionEl) continue;

      // Section Metadata block for sections that declare a style.
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        if (sectionEl.parentNode) {
          sectionEl.parentNode.insertBefore(metaBlock, sectionEl.nextSibling);
        }
      }

      // Section break before every section except the first.
      if (i > 0 && sectionEl.parentNode) {
        const hr = doc.createElement('hr');
        sectionEl.parentNode.insertBefore(hr, sectionEl);
      }
    }
  }
}
