# refinedcostseg.com — Claude Code operating rules

Hand-coded static site (no build step, no templating), GitHub → Netlify auto-deploys `main` in ~40 s. Redirects are first-match in `netlify.toml`. Content truth = git.

**Read `PUBLISHING-PLAYBOOK.md` first — it is the site's persistent working memory (site/form/engine laws, standing rules, history). Where it and this file disagree, the playbook wins; fix this file.** `SEO-BEST-PRACTICES.md` governs journal posts. System ids and the qid map live in Drive `02_ADMIN_KEY.md` (file id `16ogO9GBrLvXE7h9OIIQsiQZ3fVNC9mre`, v3.8 of 2026-10-06, plus the addendum `02B_ADMIN_KEY_ADDENDUM_2026-10-08.md` `1iHMlR-QUP9qEAET5pnmh0HxT9A0wBjqB` with the v3.9 edits until Cowork folds it in — the old ids `1EvcuFh798YEL57FnuDaTEKUNM_eMQY0B` v3.7, `1kytMt0uStr50zpWUyYMOjPIWYwvjGKv3` v3.6 and `1PZoyN2aSw54RYt0ggHEgn7YYJIH-ST-_` v3.4 are archived); the bridge repo `Ethan-Tyler-Brooks/rcs-bridge` is the ops control plane.

## Working style

Terse, mobile-first, directive; Ethan approves with single words. Small bites, explicit decision point before every push. Verify-first: read the live file before editing, `git diff` before committing, live-check after deploy. Risk-first, bottom line last.

Roadblocks are not stopping points (Ethan, 2026-09-28). When something blocks the job (a permission denial, a missing connector or credential, a "browser-only" step, a merge, a gate normally left to Ethan), finish everything else, then name every viable way Ethan could give you the access or authority to finish the rest yourself: a permission rule, a connector, a token as a Script Property or env secret, Playwright in the container, a Bypass-mode session, a standing "Go". Offer that option every time, even when the block looks like a hard rule or a preference; Ethan decides. Never silently narrow the job to what was reachable. Standing rules: Ethan's approval alone is sufficient for any ads change; Claude merges its own PRs once CI is green.

## Change control

- Branch → edit → PR. **Claude merges its own PR once the Netlify deploy preview is green** (standing rule 2026-09-28); Ethan can always merge in the browser. Never push to `main` directly.
- Every page edit: keep canonicals on `www`, JSON-LD in sync with visible copy, `sitemap.xml` + `llms.txt` updated when pages change, `404.html` branded.
- Site-wide find/replace across 60+ pages = the self-removing GitHub Actions sed workflow (`/site-sweep` in the bridge repo; proven 2026-09-27, commit e9b0dae). One small commit, not sixty re-emitted files.
- The Claude.ai connector cannot push `.github/workflows/*` (no workflow scope); a local `git push` from Claude Code can.
- After merge: confirm Netlify deploy and spot-check the live page. Do not describe the live site from memory — `git log origin/main` and a fetch.

## Hard rules (client-facing language and money)

- **Pricing is never on the public site.** The fee lives only in form calc q165, shown inside the form before payment. `/qq-x7k4` is the access-gated internal quick quote (noindex). Do not ship any widget that displays the fee.
- Documentary, cost-library-based study — never "engineering". Audit-ready, never audit-proof. No "guaranteed", no "IRS-approved". No credential claims: no "EA", no "Eugene Marshall, EA"; the approved phrase is "quality-control review". No tax advice. Never name the 7-day STR threshold or the Jan-19-2025 date inside a question. Never list Regrid.
- Look-back / §481(a) / Form 3115 content is SHELVED site-wide (journal post deleted + 301'd). Do not reintroduce.
- Business phone 414-206-1948 (Quo). The personal cell 414-429-5333 must never appear.
- Legal text (privacy, audit-support page, terms, refund language) is counsel-approved only. Known inconsistencies awaiting counsel: audit-support page cites an "engagement agreement" that does not exist; Extended-window anchor differs page vs ack; privacy says ten-year retention — quote the live ten-year statement until counsel decides. No `/terms` page yet.
- Accessibility: WCAG 2.2 AA is the standard (skip links, `<main>`, keyboard FAQ accordion, `:focus-visible`, reduced-motion, contrast tokens). Keep it.

## Referral / discount layer

`referral-codes.js` = single source of truth: SHA-256 of UPPERCASE code → `{label, pct, admin?, paid?, flat?, exp?, once?}`; stacking additive, cap 20%. A negotiated fee = one minted flat-price line (playbook, "Negotiated-price codes"). Add a partner = one hash line + optional landing page cloned from `root-river-realty.html` (noindex) + the partner on monday Referral Partners. Internal lanes (`RCS-ADMIN-*`, `PREPAID-*`) are never published.

## Forms on the site

The estimate/checkout form is Jotform `261446273575059` (pci.jotform.com embed) on `/` `#contact` and `/invest`. Form changes are NOT site changes: qid/label/condition edits go through the bridge repo's mapping + tests first (`FORM_QID_TYPES` in `src/Mapping.js`).

## Chrome

Nothing here needs the Chrome extension. Netlify dashboard and Google Search Console checks are Ethan's clicks when needed; GSC and Plausible data are readable via the Make-STR MCP tools from the bridge repo.
