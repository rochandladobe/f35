/*
 * scroll-fx.js — shared, progressive-enhancement scroll engine for the
 * cinematic homepage blocks.
 *
 * Provides three effects, all opt-in via data attributes so content stays
 * decoupled from animation logic:
 *
 *   [data-reveal]            fade/slide an element in once when it enters view
 *   [data-reveal="<name>"]   named reveal variant (up | left | right | scale)
 *   [data-parallax="<n>"]    translate an element vertically at speed <n>
 *                            (e.g. 0.2 = drifts at 20% of scroll — a slow
 *                            background layer; negative pushes the other way)
 *   [data-count="<number>"]  count a stat up from 0 to <number> when revealed
 *
 * Everything is a single IntersectionObserver + a single rAF loop shared
 * across all blocks. Under prefers-reduced-motion it degrades to the final
 * state instantly (content visible, numbers final, no motion). If JS never
 * runs, the CSS initial-hidden state is gated on `html.sfx-ready`, so
 * everything remains visible — the effects are pure enhancement.
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let initialized = false;
let revealObserver;
const parallaxItems = [];
const registered = new WeakSet();
let ticking = false;

/**
 * Animate a stat element from 0 to its data-count target.
 * Preserves an optional data-count-prefix / data-count-suffix around the number.
 * @param {Element} el
 */
function runCount(el) {
  const target = parseFloat(el.dataset.count);
  if (Number.isNaN(target)) return;
  const prefix = el.dataset.countPrefix || '';
  const suffix = el.dataset.countSuffix || '';
  const decimals = (el.dataset.count.split('.')[1] || '').length;
  const format = (v) => prefix
    + v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    + suffix;

  if (reduceMotion.matches) {
    el.textContent = format(target);
    return;
  }

  const duration = 1400;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    // easeOutExpo for a decisive, mechanical settle
    const eased = t === 1 ? 1 : 1 - 2 ** (-10 * t);
    el.textContent = format(target * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * rAF-batched parallax pass — only elements near the viewport are transformed.
 */
function updateParallax() {
  ticking = false;
  const vh = window.innerHeight;
  const mid = vh / 2;
  for (let i = 0; i < parallaxItems.length; i += 1) {
    const { el, speed } = parallaxItems[i];
    const rect = el.getBoundingClientRect();
    if (rect.bottom > -vh && rect.top < vh * 2) {
      const offset = (rect.top + rect.height / 2 - mid) * speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    }
  }
}

function requestParallax() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateParallax);
}

function ensureInit() {
  if (initialized) return;
  initialized = true;
  document.documentElement.classList.add('sfx-ready');

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('sfx-in');
      if (el.dataset.count !== undefined) runCount(el);
      revealObserver.unobserve(el); // one-shot
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

  if (!reduceMotion.matches) {
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax, { passive: true });
    requestParallax();
  }
}

/**
 * Scan a subtree and register any scroll-fx elements it contains.
 * Idempotent per element; safe to call from every block.
 * @param {Element|Document} [root=document]
 */
export function enhance(root = document) {
  ensureInit();

  root.querySelectorAll('[data-reveal],[data-count]').forEach((el) => {
    if (registered.has(el)) return;
    registered.add(el);
    if (reduceMotion.matches) {
      el.classList.add('sfx-in');
      if (el.dataset.count !== undefined) runCount(el);
    } else {
      revealObserver.observe(el);
    }
  });

  if (reduceMotion.matches) return;

  root.querySelectorAll('[data-parallax]').forEach((el) => {
    if (registered.has(el)) return;
    registered.add(el);
    const speed = parseFloat(el.dataset.parallax) || 0;
    parallaxItems.push({ el, speed });
  });
  requestParallax();
}

export default enhance;
