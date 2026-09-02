# Refined Cost Segregation — Website

Static HTML marketing site for Refined Cost Segregation. No build step, no framework — just HTML, one shared stylesheet, and one shared script. Deployed on Netlify from this GitHub repo: push to the main branch and Netlify auto-publishes.

## Structure

```
/
├── index.html                ← Homepage with structured data, OG tags, all sections
├── styles.css                ← ALL design. Edit colors, fonts, spacing in one place
├── script.js                 ← Calculator, nav, FAQ accordion, scroll reveals
├── netlify.toml              ← Netlify config (pretty URLs, headers)
├── favicon.svg               ← Brand-matched SVG favicon
├── robots.txt                ← Allows all crawlers including AI bots
├── sitemap.xml               ← Tells search engines what to index
├── llms.txt                  ← LLM-friendly site summary (llmstxt.org spec)
├── README.md                 ← This file
├── SEO-BEST-PRACTICES.md     ← What's implemented and what to keep doing
├── CONTENT-CALENDAR.md       ← Backlog of blog topics
└── journal/
    ├── index.html                              ← Blog listing page
    ├── 100-bonus-depreciation-is-back.html     ← Post #1 (Eugene, Tax policy)
    └── short-term-rental-loophole.html         ← Post #2 (Eugene, STR strategy)
```

## Editing

- **Design** (colors, fonts, spacing): `styles.css`. The brand tokens are the CSS variables at the very top (`--navy`, `--sage`, etc.).
- **Homepage copy / sections**: `index.html`.
- **Calculator math**: `script.js`, the `reclassRates` object.
- **Estimate + order form**: it's a Jotform iframe in `index.html` and `invest.html`. Search `JotFormIFrame`. See the Jotform note below.

After any edit: commit + push to GitHub → Netlify rebuilds and publishes automatically (usually under a minute).

## Adding a new blog post

Three steps — **always do all three** so the new post is actually discoverable:

1. **Create the post file**: copy an existing post in `/journal/` (e.g. `100-bonus-depreciation-is-back.html`) to a new file named with the URL slug (e.g. `str-loophole-explained.html`). Replace the title, meta description, canonical link, category tag, date, byline, and article body.
2. **Update the listing**: add a new card to `journal/index.html` so the post shows on `/journal/`. Newest post goes first.
3. **Update the homepage**: refresh the three cards in the journal section of `index.html` to show the three most recent posts (the first card is the large "feature" card).

> When Claude writes a post, Claude does all three of these automatically and hands back the updated files.

## SEO blog cadence

The goal is roughly one new post per week. Topic backlog is in `CONTENT-CALENDAR.md`. Posts can be batch-written in advance and published on a schedule, or written one at a time.

## Migration checklist (Webflow → Netlify)

- [ ] Create the GitHub repo and push these files
- [ ] Connect the repo to Netlify (New site from Git → pick the repo → deploy; no build command, publish directory `.`)
- [ ] Verify the staging `*.netlify.app` URL renders correctly
- [ ] **Confirm the Jotform form ID in `index.html` and `invest.html` is the current live form** and that the RCS Bridge (Google Apps Script) is receiving its submissions (see note below)
- [ ] Point the custom domain from Webflow DNS to Netlify
- [ ] Replace the placeholder SVG portrait for the QC reviewer card (or leave as the abstract badge)
- [ ] Decide what to do with the now-unused Webflow site + CMS (cancel Premium if not needed elsewhere)

## Jotform note

The site embeds a single Jotform, `261446273575059`, on `/` (`#contact`) and `/invest`, always via `pci.jotform.com` with `areYou25=Yes` so the form opens directly in estimate/order mode. It is a two-phase estimate + order form: **Step 1** (`areYou25=Yes`) collects the property basics, shows the projected savings and flat study fee, and takes Stripe payment; **Step 2** (`fillMode=details`) is the post-payment property questionnaire (closing statement, photos, land-value support, etc.). The referral-code UI on each page prefills `referralCode` / `discountLevel` on the iframe URL (see `referral-codes.js`).

Fulfillment runs on the Google Apps Script "RCS Bridge" inside Google Workspace (Drive folder setup, sheet/board updates, notifications). Make.com is no longer part of the pipeline — it has run nothing since 2026-08-28. The form ID appears only in the two HTML files (iframe `id` + `src` and the embed-handler selector on the same page); `script.js` contains no Jotform code, so if the ID ever changes, update `index.html` and `invest.html` only.
