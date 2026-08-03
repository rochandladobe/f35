import { getMetadata } from '../../scripts/aem.js';
import { normalizeInternalLinks } from '../../scripts/links.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetches the nav fragment markup. Tries the nav metadata path (the published
 * fragment location) first, then falls back to the canonical content path.
 * @returns {Promise<{ html: string, base: string }|null>} markup and its base path
 */
async function fetchNavFragment() {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const candidates = [`${navPath}.plain.html`, '/content/nav.plain.html'];

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
 * Closes all open dropdown panels.
 * @param {Element} navSections The nav sections container
 * @param {Element} [except] A section to leave untouched
 */
function closeAllDropdowns(navSections, except) {
  navSections.querySelectorAll('.nav-drop').forEach((section) => {
    if (section !== except) section.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Toggles a single dropdown, closing the others.
 * @param {Element} section The dropdown list item
 * @param {Element} navSections The nav sections container
 */
function toggleDropdown(section, navSections) {
  const expanded = section.getAttribute('aria-expanded') === 'true';
  closeAllDropdowns(navSections);
  section.setAttribute('aria-expanded', expanded ? 'false' : 'true');
}

/**
 * Wires hover + click + keyboard behavior for the dropdown sections.
 * @param {Element} navSections The nav sections container
 */
function decorateDropdowns(navSections) {
  const drops = navSections.querySelectorAll('.nav-drop');
  drops.forEach((section) => {
    const trigger = section.querySelector(':scope > a');
    section.setAttribute('aria-expanded', 'false');

    // click/tap on the top-level trigger toggles the panel (accordion on
    // mobile, dropdown on desktop) instead of following the link
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        toggleDropdown(section, navSections);
      });
    }

    // hover opens/closes on desktop
    section.addEventListener('mouseenter', () => {
      if (isDesktop.matches) {
        closeAllDropdowns(navSections, section);
        section.setAttribute('aria-expanded', 'true');
      }
    });
    section.addEventListener('mouseleave', () => {
      if (isDesktop.matches) section.setAttribute('aria-expanded', 'false');
    });
  });

  // close when focus leaves the nav
  navSections.addEventListener('focusout', (e) => {
    if (!navSections.contains(e.relatedTarget)) closeAllDropdowns(navSections);
  });
}

/**
 * Builds the search control (form + input + button) in JavaScript.
 * @returns {Element} the tools wrapper containing the toggle and the search form
 */
function buildSearch() {
  const tools = document.createElement('div');
  tools.className = 'nav-tools';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-search-toggle';
  toggle.setAttribute('aria-label', 'Search');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>`;

  const form = document.createElement('form');
  form.className = 'nav-search-form';
  form.setAttribute('role', 'search');
  form.hidden = true;
  form.action = '/search';
  form.innerHTML = `<input type="search" name="q" class="nav-search-input" placeholder="Search" aria-label="Search" />
    <button type="submit" class="nav-search-submit" aria-label="Submit search">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
    </button>`;

  const input = form.querySelector('input');
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    form.hidden = open;
    if (!open) input.focus();
  });

  tools.append(toggle, form);
  return tools;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNavFragment();
  block.textContent = '';
  if (!fragment) return;

  const holder = document.createElement('div');
  holder.innerHTML = fragment.html;
  resolveRelativeImages(holder, fragment.base);
  normalizeInternalLinks(holder);

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', isDesktop.matches ? 'true' : 'false');
  while (holder.firstElementChild) nav.append(holder.firstElementChild);

  // label the top-level sections
  const classes = ['brand', 'sections'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // brand
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) navBrand.querySelectorAll('p').forEach((p) => p.replaceWith(...p.childNodes));

  // sections: unwrap the <p> the fragment wraps each top-level link in, so the
  // trigger anchor is a direct child of the <li> (the caret CSS and the click
  // handler both target `.nav-drop > a`). Then mark the dropdowns.
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope > ul > li > p').forEach((p) => {
      p.replaceWith(...p.childNodes);
    });
    navSections.querySelectorAll(':scope > ul > li').forEach((li) => {
      if (li.querySelector('ul')) li.classList.add('nav-drop');
    });
    decorateDropdowns(navSections);
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation" aria-expanded="false">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  const hamburgerButton = hamburger.querySelector('button');

  /**
   * Opens or closes the mobile menu and syncs the hamburger state.
   * @param {boolean} [open] Force a state; defaults to toggling current state
   */
  const toggleMenu = (open) => {
    const expanded = typeof open === 'boolean'
      ? open : nav.getAttribute('aria-expanded') !== 'true';
    nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    hamburgerButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    hamburgerButton.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
    // lock body scroll only while the mobile menu is open (below desktop)
    document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
    // collapse any open accordion sections when closing the menu
    if (!expanded && navSections) closeAllDropdowns(navSections);
  };

  hamburgerButton.addEventListener('click', () => toggleMenu());
  nav.prepend(hamburger);

  // search control (built in JS, not authored in the fragment)
  nav.append(buildSearch());

  // close menus on Escape
  nav.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && navSections) closeAllDropdowns(navSections);
  });

  // reset state on breakpoint change: close dropdowns, unlock scroll, and
  // reset the mobile menu + hamburger when crossing to/from desktop
  isDesktop.addEventListener('change', () => {
    if (navSections) closeAllDropdowns(navSections);
    toggleMenu(isDesktop.matches);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
