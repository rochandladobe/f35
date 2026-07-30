/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroMastheadParser from './parsers/hero-masthead.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/f35-cleanup.js';
import sectionsTransformer from './transformers/f35-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-masthead': heroMastheadParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
    "name": "news-article",
    "description": "F-35 news & features article: a full-bleed masthead hero (banner image with overlaid article title, date and tag list) followed by article body prose (highlighted deck, paragraphs, inline captioned images) as default content.",
    "urls": [
      "https://www.f35.com/f35/news-and-features/A-Thousand-F-35s-and-Counting.html",
      "https://www.f35.com/f35/news-and-features/Allied-Deterrence-F-35s-Across-Europe-NATO.html",
      "https://www.f35.com/f35/news-and-features/Bipartisan_group_of_Governors_Push_for_Strong_F-35_Production_Funding.html",
      "https://www.f35.com/f35/news-and-features/Block-4-Capabilities-Sharpen-the-F-35s-Edge.html",
      "https://www.f35.com/f35/news-and-features/F-35A-Procurement-Further-Offset-Projects-Are-Strengthening-Swiss-Industry-Target-Values-Clearly-Surpassed.html",
      "https://www.f35.com/f35/news-and-features/F-35s-in-Australia-Allies-Advance-Airpower-in-the-Pacific.html",
      "https://www.f35.com/f35/news-and-features/F35-Pilots-Dominate-the-Future-Battlespace.html",
      "https://www.f35.com/f35/news-and-features/F35-in-the-Indo-Pacific.html",
      "https://www.f35.com/f35/news-and-features/F35-users-talk-capabilities-deterrence-in-Europe.html",
      "https://www.f35.com/f35/news-and-features/F35B-Touched-Down-Pacific-Coast-Highway.html",
      "https://www.f35.com/f35/news-and-features/First_Polish_F-35_Built_at_Cameris_FACO_has_Flown.html",
      "https://www.f35.com/f35/news-and-features/Flight-Path-to-3000-Shaping-the-Future-of-Air-Dominance.html",
      "https://www.f35.com/f35/news-and-features/Future-Fighters-Pilots-Planes-and-AI.html",
      "https://www.f35.com/f35/news-and-features/Germany-joins-F35-program.html",
      "https://www.f35.com/f35/news-and-features/HIMARS-F35.html",
      "https://www.f35.com/f35/news-and-features/Jacob-Had-an-Experience-He-Will-Never-Forget-at-Lockheed-Martin-in-Texas.html",
      "https://www.f35.com/f35/news-and-features/Linked-In-F-35-Interoperability-in-Action0.html",
      "https://www.f35.com/f35/news-and-features/Lockheed-Martin-Congratulates-the-Polish-Air-Force-on-First-F-35-Aircraft-Arrival-in-Country.html",
      "https://www.f35.com/f35/news-and-features/Meteors-First-Flight-on-an-F35B.html",
      "https://www.f35.com/f35/news-and-features/NATO-Allies-Expand-F-35-Integration-in-Northern-Europe-Through-Multinational-Weapons-Training-in-the-Netherlands.html",
      "https://www.f35.com/f35/news-and-features/One-Million-F35-Flight-Hours-and-Counting.html",
      "https://www.f35.com/f35/news-and-features/Red-Flag-24-2-Advancing-F35-interoperability-Nellis.html",
      "https://www.f35.com/f35/news-and-features/Romania-Joins-F-35-Lightning-II-Program.html",
      "https://www.f35.com/f35/news-and-features/Stealth-Fighters-Assemble-for-Multinational-Combat-Training-in-Australia.html",
      "https://www.f35.com/f35/news-and-features/The-ABCs-of-F-35.html",
      "https://www.f35.com/f35/news-and-features/The-F-35-Advantage-Interoperability-and-Allied-Deterrence.html",
      "https://www.f35.com/f35/news-and-features/The-F35-The-Quarterback-of-Piloted-and-Drone-Teaming.html",
      "https://www.f35.com/f35/news-and-features/USAF-F35s-defend-NATO-what-it-learned.html",
      "https://www.f35.com/f35/news-and-features/Watch-Inside-The-Worlds-Most-Advanced-Fighter-Jet.html",
      "https://www.f35.com/f35/news-and-features/agile-allies--f-35s-at-ramstein-1v1.html",
      "https://www.f35.com/f35/news-and-features/canada-announces-F35-procurement.html",
      "https://www.f35.com/f35/news-and-features/delivering-digitally-for-f35-force-management-solution.html",
      "https://www.f35.com/f35/news-and-features/f35-air-dominance-defined.html",
      "https://www.f35.com/f35/news-and-features/f35-allied-deterrence-2023-highlights.html",
      "https://www.f35.com/f35/news-and-features/f35-sensor-fusion-in-focus.html",
      "https://www.f35.com/f35/news-and-features/f35-the-most-advanced-node-in-the-21st-century-warfare.html",
      "https://www.f35.com/f35/news-and-features/f35-the-worlds-most-advanced-fighter.html",
      "https://www.f35.com/f35/news-and-features/finland-selects-the-f35-lighting-ii-as-its-next-fighter.html",
      "https://www.f35.com/f35/news-and-features/five-ways-f-35-training-is-improving-mission-readiness.html",
      "https://www.f35.com/f35/news-and-features/how-the-f35-has-reshaped-strategic-balance-in-europe.html",
      "https://www.f35.com/f35/news-and-features/japan-charts-course-to-f35-ops-at-sea.html",
      "https://www.f35.com/f35/news-and-features/pentagon-and-lockheed-martin-agree-to-f-35-sustainment-contract.html",
      "https://www.f35.com/f35/news-and-features/switzerland-selects-f35-for-future-air-defense-requirements.html",
      "https://www.f35.com/f35/news-and-features/the-f35s-unrivaled-stealth.html"
    ],
    "blocks": [
      {
        "name": "hero-masthead",
        "instances": [
          "div.masthead"
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
        "id": "article-body",
        "name": "article-body",
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
