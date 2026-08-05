/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroMastheadParser from './parsers/hero-masthead.js';
import cardsPilotParser from './parsers/cards-pilot.js';
import embedVideoParser from './parsers/embed-video.js';
import accordionParser from './parsers/accordion.js';
import cardsJumpParser from './parsers/cards-jump.js';
import embedCerosParser from './parsers/embed-ceros.js';
import cardsVideoParser from './parsers/cards-video.js';
import cardsFeatureParser from './parsers/cards-feature.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/f35-cleanup.js';
import sectionsTransformer from './transformers/f35-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-masthead': heroMastheadParser,
  'cards-pilot': cardsPilotParser,
  'embed-video': embedVideoParser,
  accordion: accordionParser,
  'cards-jump': cardsJumpParser,
  'embed-ceros': embedCerosParser,
  'cards-video': cardsVideoParser,
  'cards-feature': cardsFeatureParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
    "name": "content-page",
    "description": "General F-35 content page (About, Global Enterprise overview, news landing): a full-bleed masthead hero (banner image + overlaid title) followed by a content-well body of prose, headings, and inline images/media as default content.",
    "urls": [
      "https://www.f35.com/f35/about.html",
      "https://www.f35.com/f35/about/5th-gen-capabilities.html",
      "https://www.f35.com/f35/about/F-35-Partners.html",
      "https://www.f35.com/f35/about/F35-Built-for-the-Future.html",
      "https://www.f35.com/f35/about/Meet-The-Pilots.html",
      "https://www.f35.com/f35/about/economic-impact.html",
      "https://www.f35.com/f35/about/fast-facts.html",
      "https://www.f35.com/f35/about/sustainment.html",
      "https://www.f35.com/f35/global-enterprise.html",
      "https://www.f35.com/f35/global-enterprise/romania.html",
      "https://www.f35.com/f35/global-enterprise/singapore.html",
      "https://www.f35.com/f35/global-enterprise/united-states.html",
      "https://www.f35.com/f35/news-and-features.html"
    ],
    "blocks": [
      {
        "name": "hero-masthead",
        "instances": [
          "div.masthead"
        ]
      },
      {
        "name": "embed-ceros",
        "instances": [
          "[id^='experience-']:has(iframe.ceros-experience)",
          "div:has(> iframe.ceros-experience)"
        ]
      },
      {
        "name": "cards-video",
        "instances": [
          ".row:has(> [class*='col-'] > .youtube-shorts .video-placeholder[data-video-id])"
        ]
      },
      {
        "name": "cards-feature",
        "instances": [
          ".row:has(> [class*='col-lg-4'] > .title .articleTitle):has(> [class*='col-lg-4'] .image img):not(:has(.cnt-video)):not(:has(.video-placeholder))"
        ]
      },
      {
        "name": "accordion",
        "instances": [
          ".tab-content-cq:has(.collapse.answer)"
        ]
      },
      {
        "name": "cards-jump",
        "instances": [
          ".d-flex:has(.jumpCard)"
        ]
      },
      {
        "name": "cards-pilot",
        "instances": [
          ".column:has(.row > [class*='col-lg-6'] .image img[src*='pilot'])"
        ]
      },
      {
        "name": "embed-video",
        "instances": [
          ".cnt-video:has(iframe[data-video-src]), .cnt-video:has(iframe[src*='youtube']), .cnt-video:has(iframe[src*='youtu.be'])"
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
        "id": "content-body",
        "name": "content-body",
        "selector": "div.content-well",
        "style": null,
        "blocks": [],
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
