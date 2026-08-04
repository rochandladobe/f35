/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion. Base block: accordion.
 * Source: f35.com content-well FAQ. A cluster of question links
 * (`<a href="#answer-id">+ Q: ...</a>`) followed by collapsible answer panels
 * (`<div class="collapse answer" id="answer-id"> … <b>A:</b> text …`). We pair
 * each question with its answer panel by matching the link's #hash to the
 * panel id, and emit one accordion row per pair (Accordion convention:
 * 2 columns — title cell + content cell).
 * Generated: 2026-08-04
 */
export default function parse(element, { document }) {
  // Question links point at in-page answer panels (href="#id"). The source
  // marks them with class "question"/"f35Collapse" and data-toggle="collapse";
  // some pages label them "Q." and others "Q:". Match on the structural
  // signals first, falling back to the "Q" text prefix.
  const questionLinks = Array.from(element.querySelectorAll('a[href^="#"]'))
    .filter((a) => a.matches('.question, .f35Collapse, [data-toggle="collapse"], [data-bs-toggle="collapse"]')
      || /^\s*(?:\+\s*)?Q[.:]/i.test(a.textContent || ''));

  // Empty-block guard.
  if (questionLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  questionLinks.forEach((link) => {
    const id = (link.getAttribute('href') || '').replace(/^#/, '');
    if (!id) return;
    const panel = element.ownerDocument.getElementById(id)
      || element.querySelector(`[id="${id}"]`);

    // Question text: strip the leading "+ " affordance, keep the "Q: …" prose.
    const qText = link.textContent.replace(/\s+/g, ' ').replace(/^\s*\+\s*/, '').trim();
    const q = document.createElement('p');
    q.textContent = qText;

    // Answer: pull the paragraphs from the panel, dropping the "A:" prefix.
    const answer = [];
    if (panel) {
      panel.querySelectorAll('p').forEach((p) => {
        if (!p.textContent.trim()) return;
        const np = document.createElement('p');
        np.innerHTML = p.innerHTML;
        // Remove a leading <b>A.</b> / <b>A:</b> label from the paragraph
        // (source uses "A." on some pages and "A:" on others).
        const firstBold = np.querySelector('b, strong');
        if (firstBold && /^A[.:]?\s*$/i.test(firstBold.textContent.trim())) {
          firstBold.remove();
        }
        np.innerHTML = np.innerHTML.replace(/^\s*A[.:]\s*/i, '').trim();
        if (np.textContent.trim()) answer.push(np);
      });
    }

    cells.push([[q], answer.length ? answer : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
