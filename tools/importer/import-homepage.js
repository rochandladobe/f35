/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroMastheadParser from './parsers/hero-masthead.js';
import columnsPromoParser from './parsers/columns-promo.js';
import cardsNewsParser from './parsers/cards-news.js';
import carouselSocialParser from './parsers/carousel-social.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/f35-cleanup.js';
import sectionsTransformer from './transformers/f35-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-masthead': heroMastheadParser,
  'columns-promo': columnsPromoParser,
  'cards-news': cardsNewsParser,
  'carousel-social': carouselSocialParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
    "name": "homepage",
    "description": "F-35 homepage: full-bleed masthead hero, blue/gradient promo bands (About, Fast Facts) as two-column image+text blocks, a news teaser card row, and a social-media carousel.",
    "urls": [
      "https://www.f35.com/",
      "https://www.f35.com/f35/index.html"
    ],
    "blocks": [
      {
        "name": "hero-masthead",
        "instances": [
          "div.bg-white > div:nth-child(1)"
        ]
      },
      {
        "name": "columns-promo",
        "instances": [
          "#homeSectionTwo",
          "div.bg-white > div:nth-child(6)"
        ]
      },
      {
        "name": "cards-news",
        "instances": [
          "#homeSectionThree"
        ]
      },
      {
        "name": "carousel-social",
        "instances": [
          "#homeSectionFive"
        ]
      }
    ],
    "sections": [
      {
        "id": "masthead-hero",
        "name": "masthead-hero",
        "selector": "div.bg-white > div:nth-child(1)",
        "style": null,
        "blocks": [
          "hero-masthead"
        ],
        "defaultContent": []
      },
      {
        "id": "about-f35",
        "name": "about-f35",
        "selector": "#homeSectionTwo",
        "style": null,
        "blocks": [
          "columns-promo"
        ],
        "defaultContent": []
      },
      {
        "id": "news-and-features",
        "name": "news-and-features",
        "selector": "#homeSectionThree",
        "style": null,
        "blocks": [
          "cards-news"
        ],
        "defaultContent": [
          "#homeSectionThree"
        ]
      },
      {
        "id": "fast-facts",
        "name": "fast-facts",
        "selector": "div.bg-white > div:nth-child(6)",
        "style": null,
        "blocks": [
          "columns-promo"
        ],
        "defaultContent": []
      },
      {
        "id": "follow-us-social",
        "name": "follow-us-social",
        "selector": "#homeSectionFive",
        "style": null,
        "blocks": [
          "carousel-social"
        ],
        "defaultContent": [
          "#homeSectionFive"
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
