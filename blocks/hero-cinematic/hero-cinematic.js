import { enhance } from '../../scripts/scroll-fx.js';

/*
 * hero-cinematic — full-screen cinematic hero (Section 1).
 *
 * Authoring contract (all rows optional; order-independent by role):
 *   - an optional first row containing a <picture>  → used as the background
 *     atmosphere photo (parallax). If absent, a CSS/SVG sky is generated.
 *   - a content row with: eyebrow (p), headline (h1), sub-headline (p),
 *     and a CTA link (p > a).
 *
 * Atmosphere (sky gradient, drifting cloud layers, HUD grid) and the aircraft
 * silhouette are generated here so the block is self-contained without assets.
 */

const AIRCRAFT = `
<svg class="hc-craft-svg" viewBox="0 0 400 520" role="img" aria-label="F-35 Lightning II planform"
     xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" focusable="false">
  <defs>
    <linearGradient id="hc-skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a444f"/>
      <stop offset="0.55" stop-color="#222a33"/>
      <stop offset="1" stop-color="#151b22"/>
    </linearGradient>
  </defs>
  <g>
    <path fill="url(#hc-skin)" stroke="rgba(120,150,180,0.35)" stroke-width="1" d="
      M200 14
      L212 96 L226 150
      L250 168 L372 300 L356 316 L262 300
      L256 356 L316 424 L300 440 L244 402
      L236 456 L214 492 L200 500
      L186 492 L164 456 L156 402
      L100 440 L84 424 L144 356 L138 300
      L44 316 L28 300 L150 168 L174 150
      L188 96 Z"/>
    <path fill="rgba(90,169,255,0.18)" d="M200 40 L206 120 L200 150 L194 120 Z"/>
    <circle cx="200" cy="150" r="6" fill="#5aa9ff" opacity="0.8"/>
  </g>
</svg>`;

export default function decorate(block) {
  const rows = [...block.children];

  // background photo slot (author-supplied) — first row with a picture
  const bgPicture = block.querySelector(':scope > div picture');
  const bgRow = bgPicture ? bgPicture.closest(':scope > div') : null;

  // content = the row that carries the heading (or the last row)
  const contentRow = block.querySelector(':scope > div:has(h1, h2)')
    || rows[rows.length - 1];

  // atmosphere layer
  const atmos = document.createElement('div');
  atmos.className = 'hc-atmos';
  atmos.setAttribute('aria-hidden', 'true');
  atmos.innerHTML = `
    <div class="hc-sky"></div>
    <div class="hc-clouds hc-clouds-far" data-parallax="0.12"></div>
    <div class="hc-clouds hc-clouds-near" data-parallax="0.28"></div>
    <div class="hc-grid"></div>
    <div class="hc-vignette"></div>`;
  if (bgRow) {
    bgRow.classList.add('hc-photo');
    bgRow.setAttribute('data-parallax', '0.1');
    atmos.prepend(bgRow);
  }

  // aircraft layer (subtle counter-parallax so it feels closer)
  const craft = document.createElement('div');
  craft.className = 'hc-craft';
  craft.setAttribute('aria-hidden', 'true');
  craft.setAttribute('data-parallax', '-0.05');
  craft.innerHTML = AIRCRAFT;

  // content layer
  const content = document.createElement('div');
  content.className = 'hc-content';
  if (contentRow) {
    const cell = contentRow.firstElementChild || contentRow;
    // eyebrow = first <p> that has no link
    const paras = [...cell.querySelectorAll('p')];
    const eyebrow = paras.find((p) => !p.querySelector('a'));
    if (eyebrow && eyebrow === cell.firstElementChild) eyebrow.classList.add('hc-eyebrow');
    // CTA
    const cta = cell.querySelector('p a');
    if (cta) {
      cta.classList.add('button', 'accent');
      cta.closest('p').classList.add('hc-cta');
    }
    while (cell.firstChild) content.append(cell.firstChild);
  }

  const cue = document.createElement('div');
  cue.className = 'hc-scrollcue';
  cue.setAttribute('aria-hidden', 'true');
  cue.innerHTML = '<span></span>';

  block.textContent = '';
  block.append(atmos, craft, content, cue);

  enhance(block);
}
