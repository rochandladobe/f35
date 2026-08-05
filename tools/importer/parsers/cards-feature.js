/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base block: cards.
 * Source: f35.com "Unrivaled Capabilities" feature groups — a `.row` of
 * `.col-lg-4` columns, each with an `.image` icon, a `.title .articleTitle`
 * (blue heading) and a `.cnt_paragraph > ul` bullet list. Cards convention:
 * 2 columns per row — icon in cell 1, heading + list in cell 2.
 * Generated: 2026-08-04
 */
export default function parse(element, { document }) {
  // Each feature is a grid column with an icon image + a title + a list.
  const items = Array.from(element.querySelectorAll(':scope > [class*="col-"], :scope > .row > [class*="col-"]'))
    .filter((el) => el.querySelector('.image img, img') && el.querySelector('ul'));

  // Empty-block guard.
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    const icon = item.querySelector('.image img, img');
    const titleEl = item.querySelector('.articleTitle, .title');
    // The body copy lives in .cnt_paragraph: usually a <ul>, sometimes followed
    // by supporting <p> text. Preserve both, in source order.
    const bodyWrap = item.querySelector('.cnt_paragraph') || item;
    const list = bodyWrap.querySelector('ul');

    // Icon cell.
    let iconCell = '';
    if (icon) {
      const p = document.createElement('p');
      const pic = document.createElement('picture');
      const clean = document.createElement('img');
      clean.setAttribute('src', icon.getAttribute('src'));
      clean.setAttribute('alt', titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '');
      pic.append(clean);
      p.append(pic);
      iconCell = p;
    }

    // Body cell: heading + bullet list.
    const body = [];
    if (titleEl && titleEl.textContent.trim()) {
      const h = document.createElement('h3');
      h.textContent = titleEl.textContent.replace(/\s+/g, ' ').trim();
      body.push(h);
    }
    if (list) {
      const cleanUl = document.createElement('ul');
      list.querySelectorAll('li').forEach((li) => {
        const text = li.textContent.replace(/\s+/g, ' ').trim();
        if (text) {
          const cleanLi = document.createElement('li');
          cleanLi.textContent = text;
          cleanUl.append(cleanLi);
        }
      });
      body.push(cleanUl);
    }
    // Supporting paragraph(s) after the list (e.g. economic-impact's supplier
    // note) — keep them so no copy is lost.
    bodyWrap.querySelectorAll('p').forEach((p) => {
      const text = p.textContent.replace(/\s+/g, ' ').trim();
      if (text) {
        const np = document.createElement('p');
        np.textContent = text;
        body.push(np);
      }
    });

    cells.push([iconCell, body]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
