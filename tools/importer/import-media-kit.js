/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsResourceParser from './parsers/cards-resource.js';
import embedVideoBrollParser from './parsers/embed-video-broll.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/f35-cleanup.js';
import sectionsTransformer from './transformers/f35-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-resource': cardsResourceParser,
  'embed-video-broll': embedVideoBrollParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
    "name": "media-kit",
    "description": "Media kit page: video-forward layout centered on an embedded video block with supporting assets.",
    "urls": [
      "https://www.f35.com/f35/mediakit.html"
    ],
    "blocks": [
      {
        "name": "cards-resource",
        "instances": [
          ".row:has(.mediaCard):not(:has(a[href*=\"vimeo.com/\"]))",
          ".rteText .row:has(.mediaCard)"
        ]
      },
      {
        "name": "embed-video-broll",
        "instances": [
          ".row:has(a[href*=\"vimeo.com/\"]):not(:has(.row))",
          ".row:has(iframe[src*=\"vimeo\"]):not(:has(.row))"
        ]
      }
    ],
    "sections": [
      {
        "id": "media-kit-body",
        "name": "media-kit-body",
        "selector": "div.content-well",
        "style": null,
        "blocks": [
          "cards-resource",
          "embed-video-broll"
        ],
        "defaultContent": [
          "div.content-well"
        ]
      }
    ]
  };

// TRANSFORMER REGISTRY — cleanup always; sections only when 2+ sections
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for "${blockDef.name}": ${selector}`);
        return;
      }
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks (dedupe elements matched by multiple selectors)
    const seen = new Set();
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE).filter((b) => {
      if (seen.has(b.element)) return false;
      seen.add(b.element);
      return true;
    });

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path
    const p = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path: p,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
