/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroMastheadParser from './parsers/hero-masthead.js';
import cardsSpecsParser from './parsers/cards-specs.js';
import cardsMilestoneParser from './parsers/cards-milestone.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/f35-cleanup.js';
import sectionsTransformer from './transformers/f35-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-masthead': heroMastheadParser,
  'cards-specs': cardsSpecsParser,
  'cards-milestone': cardsMilestoneParser,
  accordion: accordionParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
    "name": "partner-country",
    "description": "Global Enterprise partner-country page: hero banner followed by a tabbed content section.",
    "urls": [
      "https://www.f35.com/f35/global-enterprise/belgium.html",
      "https://www.f35.com/f35/global-enterprise/canada.html",
      "https://www.f35.com/f35/global-enterprise/denmark.html",
      "https://www.f35.com/f35/global-enterprise/finland.html",
      "https://www.f35.com/f35/global-enterprise/greece.html",
      "https://www.f35.com/f35/global-enterprise/israel.html",
      "https://www.f35.com/f35/global-enterprise/japan.html",
      "https://www.f35.com/f35/global-enterprise/poland.html",
      "https://www.f35.com/f35/global-enterprise/republic-of-korea.html",
      "https://www.f35.com/f35/global-enterprise/switzerland.html",
      "https://www.f35.com/f35/global-enterprise/australia.html",
      "https://www.f35.com/f35/global-enterprise/united-kingdom.html"
    ],
    "blocks": [
      {
        "name": "hero-masthead",
        "instances": [
          "div.masthead"
        ]
      },
      {
        "name": "accordion",
        "instances": [
          ".tab-content-cq:has(.collapse.answer)"
        ]
      },
      {
        "name": "cards-specs",
        "instances": [
          "[id=\"English\" i] .content-well .column:not(:has(.cnt_paragraph))",
          ".content-well:not(:has([id=\"English\" i])) .column:not(:has(.cnt_paragraph))"
        ]
      },
      {
        "name": "cards-milestone",
        "instances": [
          "[id=\"English\" i] .content-well .column:has(.cnt_paragraph)",
          ".content-well:not(:has([id=\"English\" i])) .column:has(.cnt_paragraph)"
        ]
      }
    ],
    "sections": [
      {
        "id": "masthead-hero",
        "name": "masthead-hero",
        "selector": "div.masthead",
        "style": null,
        "blocks": [
          "hero-masthead"
        ],
        "defaultContent": []
      },
      {
        "id": "country-body",
        "name": "country-body",
        "selector": [
          "#English .content-well",
          ".content-well"
        ],
        "style": null,
        "blocks": [
          "cards-specs",
          "cards-milestone"
        ],
        "defaultContent": [
          "#English .content-well",
          ".content-well"
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
