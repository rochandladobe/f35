# Full-Site Migration of f35.com to AEM Edge Delivery Services

## Overview
Migrate the entire **https://www.f35.com/** website to AEM Edge Delivery Services (EDS), including page content, navigation/header, footer, and the full design system. This follows Adobe's content-driven migration workflow: discover the site, catalog page templates, build reusable import infrastructure, import content, then instrument navigation/footer and apply styling — verifying against the original at each stage.

## Confirmed Inputs
- **Source URL:** https://www.f35.com/
- **Scope:** Full site — discover all URLs, group into templates, migrate representative pages per template.
- **Includes:** Page content, navigation/header, footer, and design/styling.
- **Project base:** `aem-boilerplate` (per AGENTS.md); content served at the local preview during development.

## Phase 1 — Discovery & Cataloging
- [ ] Confirm project type and block-library endpoint (doc / da / xwalk).
- [ ] Discover all f35.com URLs via sitemap or crawl.
- [ ] Catalog page templates — group similar pages into template types.
- [ ] Produce a migration scope report (page count, template count, block inventory).
- [ ] Review the catalog together and confirm which pages/templates to migrate.

## Phase 2 — Page Analysis & Import Infrastructure
- [ ] Analyze a representative page per template (sections, content sequences, block variants).
- [ ] Survey available EDS blocks and map content to existing blocks or new variants.
- [ ] Record block mappings (DOM selectors) into the page templates.
- [ ] Generate import infrastructure: block parsers and page transformers.
- [ ] Build the reusable import script.

## Phase 3 — Content Import
- [ ] Run the bulk import to generate HTML content for each template's pages.
- [ ] Preview imported pages and verify rendering against the originals.
- [ ] Iterate on parsers/transformers to resolve structural mismatches.

## Phase 4 — Navigation / Header
- [ ] Extract navigation structure (including any mega-menu/hover-revealed content) from f35.com.
- [ ] Instrument the header block (desktop + mobile).
- [ ] Validate nav structure and behavior against the original.

## Phase 5 — Footer
- [ ] Extract footer structure and links from the source.
- [ ] Build the footer block (desktop + mobile).
- [ ] Validate footer appearance and content against the original.

## Phase 6 — Design / Styling
- [ ] Extract the design system (tokens: colors, typography, spacing) from f35.com.
- [ ] Apply global styles and style each migrated block to match the original.
- [ ] Run visual critique/comparison per block, section, and page; iterate to close gaps.

## Phase 7 — Verification & Delivery
- [ ] Run `npm run lint` and fix issues.
- [ ] Review rendered pages in the preview across breakpoints (mobile/tablet/desktop).
- [ ] Full-site visual comparison against the original; resolve remaining discrepancies.
- [ ] Prepare content for publishing and summarize results.

## Checklist (Summary)
- [ ] Phase 1 — Discovery & cataloging of f35.com
- [ ] Phase 2 — Page analysis & import infrastructure
- [ ] Phase 3 — Content import & preview verification
- [ ] Phase 4 — Navigation / header migration
- [ ] Phase 5 — Footer migration
- [ ] Phase 6 — Design system & block styling
- [ ] Phase 7 — Lint, verification & delivery

---
*This plan is ready to run. Execution (discovery, generating infrastructure, importing content, editing files) requires switching to Execute mode.*
