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
- **Contact form**: it's a Jotform iframe in `index.html`. Search `JotFormIFrame`. ⚠️ See migration note below — confirm the form ID is the current one.

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
- [ ] **Confirm the Jotform form ID in `index.html` is the current live intake form** and that its Make.com automation is wired (see note below)
- [ ] Point the custom domain from Webflow DNS to Netlify
- [ ] Replace the placeholder SVG portrait for the CCSP reviewer (or leave as the abstract badge)
- [ ] Decide what to do with the now-unused Webflow site + CMS (cancel Premium if not needed elsewhere)

## Jotform note

The contact form embeds Jotform form `261446273575059` — "Refined Cost Segregation — Get Your Free Tax Savings Estimate." This is the current live intake, wired to the Make.com automation. It's built as a short capture form by default; the full intake only appears once a visitor selects "yes, ready to move forward" (the Q25 gate). The form ID appears in two files — `index.html` (the iframe `id` + `src`) and `script.js` (the auto-resize handler selector) — so if it ever changes, update both.
