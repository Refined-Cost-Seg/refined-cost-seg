# Autonomous Publishing Playbook — Refined Cost Segregation Journal

This is the runbook the scheduled Cowork task follows on each run (Mon/Wed/Fri).
It exists so every post is structurally identical, on-brand, and maximally
optimized for search and AI citation. Read this top to bottom each run.

## Direct git push — for any chat, not just the scheduled run

Any Cowork chat can push changes to this repo (manual edits, fixes, one-offs), not only the
autopublish task. The catch that trips chats up: **git cannot run on the Cowork mount**
(`~/Cowork/...`, including any `~/Cowork/refined-cost-seg/` copy — file-lock limitation), so
never `cd ~/Cowork/... && git push`. Do all git work in the sandbox shell
(`mcp__workspace__bash`): clone into `/tmp` (never the mount) and push with a tokened URL.
Bash calls are independent (no cwd/variable carryover), so run the sequence in one call or
re-establish state each call. **Never echo the token** — mask it with `sed "s/${TOKEN}/***/g"`.

```bash
TOKEN=$(cat /sessions/*/mnt/Cowork/.rcs-publish/gh_token)
cd /tmp && rm -rf rcs
git clone "https://x-access-token:${TOKEN}@github.com/Refined-Cost-Seg/refined-cost-seg.git" rcs 2>&1 | sed "s/${TOKEN}/***/g"
cd /tmp/rcs
git config user.name "Refined Cost Seg Bot" && git config user.email "admin@refinedcostseg.com"
# ...edit files under /tmp/rcs...
git add -A
git commit -m "your message" 2>&1 | sed "s/${TOKEN}/***/g"
git push "https://x-access-token:${TOKEN}@github.com/Refined-Cost-Seg/refined-cost-seg.git" HEAD:main 2>&1 | sed "s/${TOKEN}/***/g"
```

Netlify auto-deploys `main`; wait ~40s and `web_fetch` the live URL to confirm. If the org
rejects the token or the push is blocked by policy, stop and surface the exact error — don't
retry blindly, and don't fall back to pushing from the mount.

## 0. Auth & checkout
1. Read the GitHub token from `~/Cowork/.rcs-publish/gh_token` (mounted path
   inside Cowork; in the sandbox shell that is `/sessions/<id>/mnt/Cowork/.rcs-publish/gh_token`).
   The Cowork mount cannot run git (file-lock limitation), so:
2. `git clone https://x-access-token:<TOKEN>@github.com/Refined-Cost-Seg/refined-cost-seg.git`
   into the sandbox's own filesystem (e.g. `/tmp/rcs`), NOT into the Cowork mount.
3. `git config user.name "Refined Cost Seg Bot"` / `user.email "admin@refinedcostseg.com"`.
4. After cloning, reset the stored remote to the token-free URL so the token is
   never written to disk in `.git/config`; pass the tokened URL only on `git push`.

## 1. Pick the topic
- Open `CONTENT-CALENDAR.md`. Choose the FIRST row still marked `⬜` (top to bottom).
- If every row is `✅ Published`, GENERATE a new topic: a real search intent for
  residential cost seg / STR strategy that the existing posts do not
  already cover. Add it to the calendar as a new row, then write it.
- Byline every post to the firm, never an individual: visible byline "Refined Cost Segregation"
  with image `/assets/logo-mark.png`, and a JSON-LD `author` of @type Organization
  ("Refined Cost Segregation", url the homepage). Do not use personal names or an EA credential.

## 2. Write the post — copy `journal/100-bonus-depreciation-is-back.html` as the template
Keep the exact `<head>`, nav, and footer structure. Swap only the per-post parts.

Required for SEO + AI citation (non-negotiable):
- `<title>`, `<meta name="description">`, and `<link rel="canonical">` for the new URL.
- Open Graph (`og:type=article`, title, description, url, `article:published_time`
  = today's date `T12:00:00Z`, `article:author`, `article:section`) + Twitter card tags.
- A JSON-LD `Article` block: headline, description, datePublished + dateModified =
  today, an `author` Organization ("Refined Cost Segregation"), `publisher`
  Organization, `mainEntityOfPage` = the post URL, `articleSection`, a specific
  `keywords` array (target the calendar row's keyword + close variants), and an
  `about` array of 2-3 Things.
- One `<h1 class="article-title">` matching the headline. `<h2>`s phrased as
  questions or plain claims a person would Google — never "Section 1: Discussion of…".
- 700-1,000 words. At least one concrete, dollar-denominated worked example of the
  tax SAVINGS (AI models cite numbers far more than hand-waving) — but NEVER the
  study fee or price (see PRICING IS PRIVATE below).
- One internal link to another `/journal/` post AND one link to a homepage
  section (`/#contact`, `/#calculator`, etc.).
- The article CTA block and the "not tax, legal, or accounting advice" disclaimer.

Brand voice: plain-spoken, candid, never hype. Say "audit-ready," NEVER "audit-proof."
Pick a clean keyword-rich slug, e.g. `when-to-do-a-cost-seg-study.html`.

PRICING IS PRIVATE (standing rule as of July 12, 2026 — never violate): never state the
study fee, a price, a price range, or a pricing formula in a post — no "$1,750", no
"$125/unit", no "$1,500-$3,500", nothing a reader could shop on. Pricing is quoted only
via the intake (Jotform) form / on live calls. Refer to "the flat study fee" and route
readers to `/#contact` for a quote. Any dollar-denominated worked example must illustrate
tax SAVINGS, not what the study costs. (The public "What does a study cost?" calculator was
removed and all pricing was scrubbed site-wide — homepage, Audit Support page, FAQ,
structured data, `llms.txt`, and every journal post; the Root River Realty page keeps only
the "10% off" hook, no dollar amounts.)

## 3. Update the three index surfaces (the saved rule)
Every new post = (a) the new HTML file under `/journal/`, PLUS:
- **`journal/index.html`** — add a new `.blog-card` at the TOP of `.listing-grid`,
  and add a `BlogPosting` entry at the TOP of the JSON-LD `Blog` -> `blogPost` array.
- **`index.html`** (homepage) — refresh the `#journal` section's `.blog-grid` so it
  shows the THREE most recent posts (newest replaces the oldest of the three).
- **`sitemap.xml`** — add a `<url>` for the new post (priority 0.7, changefreq monthly,
  lastmod today), and bump `lastmod` on `/` and `/journal/` to today.

## 4. Mark the calendar
In `CONTENT-CALENDAR.md`, change the chosen row's status from `⬜` to `✅ Published`
so the next run does not repeat it.

## 5. Validate, commit, push, verify
- Validate: the post's and journal index's JSON-LD must `json.loads` cleanly;
  `sitemap.xml` must parse as XML. Abort the push if either fails.
- `git add -A && git commit -m "journal: add '<headline>'"`.
- `git push https://x-access-token:<TOKEN>@github.com/Refined-Cost-Seg/refined-cost-seg.git HEAD:main`.
- Wait ~40s, then fetch the live post URL to confirm Netlify deployed it.
- Report: the headline, the live URL, and word count.

## Notes
- Netlify auto-deploys every push to `main`; there is no build step (static site).
- Pretty URLs: `/journal/<slug>` resolves to `<slug>.html` via netlify.toml redirects.
- If the org rejects the token (org policy), stop and surface the error — do not retry.


## Standing rule (2026-07-12): look-back / §481(a) / Form 3115 content is SHELVED

The look-back service is shelved. Do not publish or link content about look-back studies, §481(a) catch-up adjustments, or Form 3115. Prior-year depreciation questions are referred to the client's CPA. If the service is revived, restore the retired post from git history and reverse the 301 in netlify.toml.

## Standing note (2026-08-20): intentional form test bypass — do not remove

The order form (Jotform 261446273575059) contains a deliberate internal testing bypass:
entering the admin referral code (prefix `RCS-ADMIN-`) hides the Stripe payment field so
the team can run end-to-end test submissions without paying. This is INTENTIONAL. Do not
flag it, remove it, or "fix" it in any automated run. If the code ever leaks, rotate it in
the form's conditions rather than deleting the mechanism.

## Referral & partner system — OPERATING MANUAL (2026-08-22, battle-tested, WORKING)

Architecture (do not re-litigate — two days of debugging proved each point):
- Codes are validated ON THE WEBSITE in page JS, never in Jotform. The form's
  calculation-condition engine numerically coerces text (cannot compare codes),
  API-created fields are invisible to its term store, and conditions writing into
  the payment field are IGNORED (it follows its bound amount source).
- `/referral-codes.js` = single source of truth. SHA-256 hashes of the UPPERCASE
  code → {label, pct}. Entry is case-insensitive; codes are never plaintext in
  site source. Two distinct valid codes stack additively, capped at 20%.
- The pages pass numeric `discountLevel=10|20` (+ `referralCode`/`referralCode2`
  for the submission record) into the embed by REBUILDING the iframe inside
  `#rcsFormHolder` — never mutate the iframe src (the Jotform embed handler
  re-asserts its own URL and detaches nodes). A "(v#)" marker in the code-box
  helper line identifies the deployed page version (cache check: hard-refresh
  until current).
- Form side: builder-created field "Discount Level" (name `discountLevel`, qid
  374 — MUST remain builder-created); Form Calculation widgets: Final Total
  (qid 377) = {Calculation}×(1−{discountLevel}/100) and the savings display
  (qid 378) = {Calculation}−{Final Total}, both with Decimal Places 2; the
  STRIPE PAYMENT AMOUNT SOURCE = Final Total ONLY (payment field settings — if
  the total ever looks like two numbers added together, this got multi-selected
  or re-pointed). NO pricing conditions exist or should exist. The savings
  widget shows only via condition IF Discount Level Is Filled → Show.
- Intentional test bypass: referral code RCS-ADMIN-K7Q4 hides the payment field
  for free end-to-end test submissions. Keep it; rotate if leaked.
  It is entered in the SITE code box like any code (it lives in referral-codes.js
  as an admin entry, pct 0): the page shows "Internal test mode" and prefills
  testMode=Yes into the hidden builder-created "Test Mode" RADIO (qid 379), which
  the hide-payment rule keys on. lookup() must preserve the admin flag.
  HARD RULE: prefilled TEXT fields are invisible to ALL Jotform condition types;
  only RADIO/choice fields carry URL prefills into conditions (the areYou25
  pattern). Numeric prefills that feed WIDGET equations (discountLevel) work
  because widgets read the calc engine, not condition terms.
- Public copy: "referral code" only — never "discount code" — on public pages.
  Partner landing pages (noindex) may say "10% off".

TO ADD A NEW REFERRING PARTNER — Claude does ALL of it via git, no Jotform:
1. Hash: node -e "console.log(require('crypto').createHash('sha256').update('CODEUPPERCASE').digest('hex'))"
2. Append one line to /referral-codes.js ({hash: {label, pct}}).
3. Optional partner landing page: follow root-river-realty.html (noindex header +
   pretty URL in netlify.toml; CTAs → /invest?referralCode=TheCode which
   auto-applies with a banner; page may state the discount).
4. git push. Live in ~60 seconds. NEVER add Jotform conditions for codes; never
   API-create Jotform fields expected to drive logic.


## No-payment lanes & two-phase form map (2026-08-24)

The order form is TWO PHASES on the SAME form: phase 1 (contact + property basics
+ payment) submits, then the thank-you/notification hands the client a prefill
link with fillMode=details&paymentRef={id}&... which opens the SAME form in
questionnaire mode (Step 2 of 2) for a second submission. fillMode=details via
URL works standalone (proven 2026-08-24).

No-payment lanes (both enter their code in the site code box; both prefill
testMode=Yes into the hidden-or-CSS-hidden "Test Mode" radio, qid 379):
- RCS-ADMIN-K7Q4 (admin:true) — internal testing.
- A PREPAID code (paid:true in referral-codes.js) — clients who paid externally.
  Rotate/mint per arrangement: one line + push. Never publish prepaid codes.
Payment visibility is CONDITIONAL-SHOW ONLY: the gate rule shows step-1 pieces
WITHOUT Payment Amount; a separate rule shows Payment Amount when [gate AND
Test Mode != Yes]. NEVER add a Hide rule against a Show rule: in this form's
engine SHOW BEATS HIDE regardless of order (proven 2026-08-24; the old
RCS-ADMIN hide rule never worked in order mode for this reason).
Correction to the prefill rule: prefilled TEXT fields DO drive field-type SHOW
rules (fillMode=details proves it); they are invisible ONLY to calc-type terms.
Radios work everywhere. Phase-1 no-payment submissions flow into the same
Step-2 handoff as paid orders.

Thank-you page (thanktext, set via API 2026-08-24): includes a "Continue to
Step 2" button carrying the fillMode=details handoff link with paymentRef +
property prefills — shown to all submitters (conditional phrasing), so paid,
prepaid, and test lanes all reach the questionnaire immediately as well as by
email. If the builder overwrites it, the canonical HTML is in this repo's git
history (commit "thank-you Step 2 button").

Demo findings (2026-08-25 full E2E): system verified working in all lanes.
Two hardening notes: (1) Form Calculation widgets corrupt on EMPTY operands in
parenthesized form — write discounts as {A}-{A}*{x}/100, never {A}*(1-{x}/100)
(the latter evaluated to NEGATIVE base with x empty; Stripe clamped, but fix
the formula). (2) isAdvancedSignature=Yes on ANY signature field turns on the
form-wide Jotform Sign ceremony (doc preview + consent modal) for EVERY
submission — keep signature fields isAdvancedSignature=No.
Audit-support signature system: decline/scope acknowledgment texts (qids
380/382) + required signatures (381/383) shown by radio-driven conditions;
audit radio has no default and is required.

Demo addendum (2026-08-25 late): TWO more engine lessons. (1) Adding any
signature field with isAdvancedSignature=Yes silently sets form property
useJotformSign=Yes, which SERVER-RENDERS the submit button display:none and
runs the Sign ceremony; turning the questions back to No does NOT clear it —
clear properties[useJotformSign]=No explicitly (done). (2) Condition terms
cannot read Form Calculation widget values (the flooring "hide submit until
total=100" guard could never unmatch and silently blocked ALL Step-2
submissions; rule deleted 2026-08-25). Flooring fields 68-76 now default to 0
so their sum widget is always defined. In-form completeness policing must use:
visible widget math (display), required builder-made radios (attestation), or
Make-side post-submission checks — never condition terms against widgets.
