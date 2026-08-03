import { enhance } from '../../scripts/scroll-fx.js';

/*
 * mission-scroll — "Mission Capabilities" (Section 4).
 * Row 1: header (eyebrow, h2) — pinned as a corner label.
 * Rows 2..n: mission scenes — cell 1 = title, cell 2 = description.
 *
 * Desktop: the panels scroll horizontally, driven by vertical scroll through a
 * tall pinned (sticky) stage. Mobile / reduced-motion: panels stack vertically
 * (no scroll hijack), so it always remains readable and keyboard-accessible.
 */

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const horizOK = window.matchMedia('(min-width: 900px)');

export default function decorate(block) {
  const rows = [...block.children];
  const [headRow, ...missionRows] = rows;

  const outer = document.createElement('div');
  outer.className = 'ms-outer';
  const sticky = document.createElement('div');
  sticky.className = 'ms-sticky';
  const track = document.createElement('div');
  track.className = 'ms-track';
  sticky.append(track);
  outer.append(sticky);

  // pinned corner label
  if (headRow) {
    const label = document.createElement('div');
    label.className = 'ms-label';
    const eyebrow = headRow.querySelector('p:first-child');
    if (eyebrow && !eyebrow.querySelector('a')) eyebrow.classList.add('fx-eyebrow');
    while (headRow.firstElementChild?.firstChild || headRow.firstElementChild) {
      const cell = headRow.firstElementChild;
      while (cell.firstChild) label.append(cell.firstChild);
      cell.remove();
    }
    sticky.append(label);
  }

  missionRows.forEach((row, i) => {
    const cells = [...row.children];
    const title = cells[0]?.textContent.trim() || '';
    const desc = cells[1]?.innerHTML || '';
    const panel = document.createElement('article');
    panel.className = 'ms-panel';
    panel.style.setProperty('--ms-i', i);
    panel.innerHTML = `
      <div class="ms-scene" aria-hidden="true"></div>
      <div class="ms-body">
        <span class="ms-num">0${i + 1}<span>/0${missionRows.length}</span></span>
        <h3 class="ms-title">${title}</h3>
        <p class="ms-desc">${desc}</p>
      </div>`;
    track.append(panel);
  });

  block.textContent = '';
  block.append(outer);

  const panels = missionRows.length;

  const layout = () => {
    const on = horizOK.matches && !reduce.matches && panels > 1;
    block.classList.toggle('ms-horizontal', on);
    if (on) {
      outer.style.height = `${panels * 100}vh`;
      track.style.width = `${panels * 100}vw`;
    } else {
      outer.style.height = '';
      track.style.width = '';
      track.style.transform = '';
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (!block.classList.contains('ms-horizontal')) return;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const rect = outer.getBoundingClientRect();
      const dist = outer.offsetHeight - window.innerHeight;
      const progress = Math.min(Math.max(-rect.top / dist, 0), 1);
      const shift = progress * (track.scrollWidth - window.innerWidth);
      track.style.transform = `translate3d(${-shift}px, 0, 0)`;
    });
  };

  layout();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { layout(); onScroll(); }, { passive: true });

  enhance(block);
}
