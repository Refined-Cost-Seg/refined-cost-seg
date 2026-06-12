# SEO & AI Optimization — What's Done and What's Next

A real-world audit and playbook for refinedcostseg.com. This document covers what changed in this session, what each piece is doing, and what to keep doing as you publish.

## What was implemented

### Structured data (the biggest win)

Every page now ships with JSON-LD structured data that tells both search engines and AI models exactly what this site is.

**Homepage** carries a single `@graph` block with 7 linked entities:
- `Organization` — Refined Cost Segregation
- `ProfessionalService` — the business itself with offers and a service catalog
- `WebSite` — for site-level search behaviors
- `Person × 2` — Ethan and Eugene as cofounders, with Eugene's EA credential explicitly modeled
- `Service` — Cost segregation study, with the $1,750 starting offer
- `FAQPage` — auto-built from the 8 FAQ items on the page, so questions like "do you do site visits?" can show up as rich results in Google and as direct quotes in AI answers

**Blog posts** each carry an `Article` schema with proper `datePublished`, named `author` (Eugene), `publisher`, `keywords`, and `about` entities. The article schema is what makes a post citable: it gives an LLM a clean source to attribute when answering a related question.

**Journal index** carries a `Blog` schema listing the posts.

This single change is the most important thing in this update. AI-driven search (Google AI Overviews, ChatGPT search, Perplexity, Claude's web search) leans heavily on structured data when picking what to cite.

### Social previews (Open Graph + Twitter)

Every page now generates a proper preview card when shared on LinkedIn, Twitter, Slack, iMessage, Facebook, or any other platform that reads OG tags. Without these, links share as ugly URL stubs.

### `robots.txt`

Explicitly allows every major AI crawler (GPTBot, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, meta-externalagent) in addition to the standard `*` allow. Some sites block these as a default; for a content-led marketing strategy where being cited in AI answers is a real channel, explicit allow is the right call.

### `sitemap.xml`

Standard XML sitemap with the homepage, journal index, and both posts. Submit this to Google Search Console once you set GSC up (see "What's still on you" below).

### `llms.txt`

This is a newer convention (see [llmstxt.org](https://llmstxt.org)) — a Markdown-formatted summary specifically for LLMs. Think of it as a structured executive brief that helps a model quickly understand who you are, what you do, and what your canonical content is. Anthropic, Perplexity, and others read these. It's not yet a universal standard, but the cost of having one is near zero.

### Favicon

`favicon.svg` matches the brand — navy outline, sage-and-navy R-with-house logo. SVG favicons are supported in every modern browser and stay crisp at any size.

### Canonical URLs

Every page declares its canonical URL, which prevents duplicate-content issues (e.g., `refinedcostseg.com/` vs `www.refinedcostseg.com/` vs `refinedcostseg.com/index.html` being treated as three separate pages).

### Other meta

`<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">` — explicitly tells search engines to use the largest preview formats available.

## What's still on you (and worth doing)

Five things, in rough order of impact:

**1. Set up Google Search Console.** Free, takes 10 minutes. Verify domain ownership via a DNS TXT record at GoDaddy, then submit the sitemap. This is how you'll actually see what queries you rank for. Same idea, smaller value: Bing Webmaster Tools.

**2. Add a real OG image.** Right now the OG tags are configured but there's no preview image. When someone shares the homepage in iMessage or LinkedIn today, the card shows text-only. A 1200×630 PNG with the logo, tagline, and brand colors fixes that. Canva or Figma works fine for this. Save it as `/og-image.png` at the repo root, then add `<meta property="og:image" content="https://www.refinedcostseg.com/og-image.png">` to each HTML head.

**3. Add Plausible or Google Analytics.** You can't improve what you can't measure. Plausible is privacy-friendly and ~$9/month; GA4 is free but heavier. Either gives you traffic, sources, top pages, and conversion tracking.

**4. Build out the content calendar.** You have 12 unwritten topics in `CONTENT-CALENDAR.md`. Topical breadth in this niche (residential cost seg + STR strategy + look-backs) is small enough that ~15 well-written posts puts you near comprehensive coverage. AI models reward sites that are clearly the canonical source on a topic.

**5. Inbound links.** Hardest and most valuable. Three concrete moves:
   - Write a guest post for one of Eugene's tax-CPE / EA-community publications
   - Get a backlink from Magnolia Tax Services (since Eugene runs it, this is easy)
   - Get a backlink from Refined Mortgage (since Ethan runs it, also easy)

## Ongoing practices for blog posts

Each new post should hit these points to compound the SEO + AI-citation flywheel. The first three are non-negotiable; the rest are easy wins.

**Required:**

- **Real publish date in the article header** and a matching `<meta property="article:published_time">`. Freshness is a ranking signal and an AI-citation signal.
- **JSON-LD `Article` schema** with the post's specific `keywords` and `about` entities. Copy the bonus-depreciation post's schema as the template — just swap the headline, description, dates, keywords, and `mainEntityOfPage` URL.
- **Canonical link** matching the post URL.

**Strongly recommended:**

- A clear `<h1>` matching the article title, and only one per page.
- Subheadings (`<h2>`) phrased as questions or claims a real person might Google. "Where the math actually pencils" is fine. "Section A: Discussion of the Pertinent Mechanics" is not.
- At least one internal link to another post and one to a homepage section (e.g., `/#calculator` or `/#contact`).
- A concrete, dollar-denominated example whenever possible. AI models cite numbers more than they cite hand-waving.
- The "not tax advice" disclaimer paragraph at the bottom — protects you legally and signals trustworthiness.

**Per the saved rule:** every new post = (a) the new HTML file under `/journal/`, (b) updated `/journal/index.html` with a card for the new post at the top, (c) refreshed homepage journal section showing the three most recent.

## What good looks like in 6 months

If the blog hits ~25 posts at one a week, all with the structure above, and you've earned 3-5 inbound links from CPE publications, CPA blogs, and your sister businesses — you should be the top organic result for several long-tail queries like:

- "residential cost segregation small landlords"
- "cost segregation duplex"
- "STR loophole material participation"
- "look-back cost segregation §481(a)"

And — more importantly given how people actually search now — when someone asks ChatGPT or Claude or Perplexity "is residential cost segregation worth it for a $400K rental?" — the answer is more likely to cite Refined Cost Segregation than a generic Investopedia article.

That's the asset you're building.
