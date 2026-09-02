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

## Engine: aggressive-default site utilities + reviewer pare-back (2026-08-26)
Owner directive (Ethan): the engine defaults AGGRESSIVE and reviewers pare
back. Approval is pure governance — "Suggested" and "Approved" produce
identical dollars (Project_Assets col S ignores the distinction; only
"Excluded" zeroes a row), so a submission's draft allocation IS the valid
report once a reviewer signs off. Reviewer decisions go in
Project_Assets!AC (starts with A=Approved, E/X=Excluded); the plug (A-017)
and BC renormalization keep tie-out exact on any combination.

Change made in Master Engine LIVE (1jwirbBwui3H7S5n-xrDaWpVOQ039MkfT5knSZx3JNbs):
- Automation_Rules rows 60-61: R-059 (A-015 Septic, $25K med) and R-060
  (A-016 Well, $15K med) trigger on Units>0 — i.e., suggested on EVERY
  property. Both assets pre-existed in Asset_Library rows 16-17 with
  validated cost tiers (VVV) but had no rules. Reviewer EXCLUDES when
  municipal (county record / closing docs).
- Building_Components G2 (Sewer/Septic), G7 (Water Well), G22 (Well J-Box)
  are now FORMULAS: auto "No" while the matching asset is not Excluded,
  auto-restore on exclusion. Prevents double-count; BC renormalizes.
- Engine architecture (decoded 2026-08-26): Automation_Rules row N ↔
  Suggested_Assets row N ↔ Project_Assets row N (formula-linked 1:1,
  coverage through row 64). Adding a default = one Automation_Rules row
  (+ Asset_Library row if the asset is new). Rules marked "HELD — market
  cost NOT approved" follow the Eugene sign-off protocol; never activate
  those without cost validation.
- Utility LATERALS (electric/water/phone/gas, ~$8K) remain in the 27.5-yr
  building split — moving them to 15-yr is a tax position needing Eugene's
  call + new library assets. Open item.
- Landscaping rules (R-043/R-044) compute qty 0 when Grounds Composition /
  Plant Density intake fields are blank — intake completeness item, catch
  in reviewer scrub.

## Source of truth: Drive → Workflows folder (2026-08-26)
The Google Drive "Workflows" folder is the company's operational source of
truth, numbered 00-10 with an index: 00_README_INDEX.md (catalog + start-here
paths), 01_RCS_MASTER_GUIDE.md (entire process start-to-finish, current),
02_ADMIN_KEY.md (PRIVATE owners' ops key — every system ID/recipe; supersedes
CLAUDE_CONTEXT_OWNERS.md), 03 Training Manual v3.5 (reviewer craft + email
library, still canonical), 04-10 reference docs. Superseded files live in its
ARCHIVE/ as "ZZ OLD (reason) — name". Material system changes update BOTH this
playbook AND 02_ADMIN_KEY.md the same day.

## Form helper-text pass (2026-08-26)
All six quality-tier dropdowns (qids 35-40) now carry rich descriptions with
concrete brand/material examples per tier + "Not sure? Choose Medium — the
reviewer verifies from photos." Grounds trio (170/172/173), land value (12),
fence LF (84), closet shelving LF (189) got examples; flooring fields 68-76
sublabels note the nine fields should total ~100%. COMPLIANCE FIX: the
contract-date sublabel (qid 174) previously named the Jan-19-2025 bonus cliff
— rewritten neutrally (never name the threshold in a question; manual Part
eight rule). Writes were query-param API edits; if a builder session was open
during them, re-verify in the builder.

## Cloud publishing + Make prune (2026-08-26 late)
All Cowork scheduled tasks are now CLOUD-FIRST (they run with Ethan's laptop
closed). Publishing auth: the official GitHub MCP connector (OAuth,
account-level, covers Refined-Cost-Seg org + Ethan-Tyler-Brooks repos) —
commits go through connector tools (get_file_contents / push_files), one
commit per publish; Netlify deploys main regardless of commit method. The
LOCAL git-token method in this playbook remains the fallback for local runs
(token files: .rcs-publish/gh_token for this repo, gh_token_pinedandy_rmg for
the other three sites). Never paste tokens into chats or task prompts.
Make is EXCLUSIVELY Cost Seg operations. Active scenarios are exactly three:
Intake Bridge 5102194, Lead Router Estimate 5989089, Lead Router Shortform
6001867. Deactivated 2026-08-26: Referral Code Sync 5642956 (dead qid-192
field — page-layer referral system replaced it), Order Bridge 5602490 +
Lead Router Order 5989105 (legacy order form). A briefly-created Make GitHub
passthrough tool was retired unused (token never set) — delete from MCP
Toolboxes at leisure.

## GitHub identity map (2026-08-26, verified in-browser)
TWO personal GitHub accounts (no orgs): "Refined-Cost-Seg" owns
refined-cost-seg; "Ethan-Tyler-Brooks" owns refined-mortgage-site-clean,
PineAndDandy, hubcityheatingandair. The Claude GitHub MCP connector is
authorized as Ethan-Tyler-Brooks, the "Claude Github MCP Connector" app is
installed on BOTH accounts (All repositories), and Ethan-Tyler-Brooks is a
collaborator on Refined-Cost-Seg/refined-cost-seg — so connector tools reach
all four repos. GitHub App rule to remember: user-token access = app
installed on the resource owner AND the user has repo permission — if a repo
ever 401s, check both halves. (A separate "Claude" app authorization on the
Refined-Cost-Seg account is the Claude Code PR app — unrelated, leave it.)

## 2026-09-01/02 — top-to-bottom review: what changed (READ THIS BEFORE the sections above that mention Make)
SUPERSEDES the "Cloud publishing + Make prune" Make paragraph and the Aug-26 form map where they conflict.
- **Make.com runs NOTHING (since 2026-08-28).** Fulfillment + lead routing = the Google Apps
  Script **RCS Bridge** (private repo github.com/Ethan-Tyler-Brooks/rcs-bridge, main de3d36b, 157
  tests; Apps Script project "RCS Bridge" running as admin@). Never reactivate a Make scenario.
  Kept on-demand only: the Sheets/Drive/Jotform passthrough tools and the parked upload webhook.
  Full ops key: Drive → RCS Share Folder › Workflows › 02_ADMIN_KEY.md (v3.0).
- **Form 261446273575059 changes (2026-09-01):** q384/q385 flooring confirmation gated to Step 2
  (they had leaked into Step 1 for every visitor); q136 banded avg-stay radio HIDDEN, replaced by
  q386 number "average nights per booking" (never name the 7-day threshold in a question); new
  Step-2 questions q387 taxpayer/entity · q388 closing date · q389 first tax year · q390
  improvements list · q391 Mechanicals Photos · q392 accuracy & scope confirmation (required);
  q94 sewer / q95 well gained "Not sure"; q143 driveway asked on every file (Pavers, None added;
  144/145 shown when a type is chosen); q101 prior-depreciation upload REQUIRED when q32 = Yes;
  q169 referred-by email now follows q118/q119; q377 Final Total UNHIDDEN as "Your flat study fee
  (total)" (Step 1 only — the site promises the fee before payment).
  ENGINE LAW ADDENDUM: conditions are still not API-writable, but the Jotform MCP `edit_form`
  editor agent applies ONE rule per call reliably (~90 s); a six-rule batch silently never applied.
  Always verify with GET /form/{id}/properties?properties[]=conditions afterwards. New questions
  created by API are visible in Step 1 until their Fill-Mode show rule lands — set hidden=Yes on
  creation as the safety net (Show rules override hidden).
- **Engine v1.21 (2026-09-01):** Intake_Tracker = 108 columns A–DD (CU Sewer System · CV Private
  Well · CW Septic Likely · CX Well Likely · CY Taxpayer / Entity Name · CZ Closing Date · DA First
  Tax Year Claimed · DB Improvements Detail · DC Avg Nights Per Booking · DD Accuracy
  Confirmation). R-059/R-060 now trigger on Septic Likely / Well Likely = Yes (bridge-derived: No only
  on a stated Public Sewer / no well) — aggressive when unknown, evidence-led when known. The bridge
  checks the header row against its 108-header contract before every write; adding/renaming an
  Intake column without a bridge release breaks the build (loudly, by design). Master Engine title
  is now "…(Bridge-fed; …)". ZZ BACKUP 2026-09-01 in AUTOMATIONS/ARCHIVE.
- **monday:** the router flips a lead to Ordered only with payment evidence (Stripe record on the
  Step-1 q166, or the test/prepaid lane q379); otherwise it posts "verify in Stripe". The Review
  Pipeline board scrub and the Pre-Flight Reviewer task were retired 2026-08-27 — the reviewer's
  checklist is the per-P-folder "Needs — P-…" sheet + the bridge's build email.
- **Site pass (commits 8194cfe, 00350a1):** #process rewritten to the pay-first flow; deliverables
  named (report PDF + fixed-asset CSV + one-page CPA implementation letter); "fifteen-minute
  feasibility call" CTAs retired in all 34 posts (use "Start with the free instant estimate … or
  call us for a candid yes or no"); "What to have ready" blocks on / and /invest; privacy vendor
  line = Google Apps Script within Google Workspace. New posts must use the new CTA sentence.
- **Workflows folder moved** into RCS Share Folder › Workflows (ethan-owned, id
  1g5t0J2FRtOqyrl-ltBt4VUiD1B1w4J16); numbered set now 00–10 with PDFs for every doc, v3.6/v1.1/
  v2.2/v2.1 reissues, HTML sources beside the PDFs. 02_ADMIN_KEY.md stays Markdown.


## 2026-09-02 round 2 — what else changed (same review, second pass)
- **Bridge main = cc4371c (PRs #4–#5, 215 tests), nine standalone .gs files, SEVEN triggers** (weeklyReview Mondays 7 AM CT). New: daily form-schema drift detector (`checkSchema`, alerts "FORM SCHEMA DRIFT", monthly form snapshot to _assets/ARCHIVE); reviewer Gmail DRAFTS (T2 welcome, T3 ask) created in admin@ on every build — never auto-sent; milestone emails M1/M2 built but `MILESTONE_EMAILS=false`; `freeze("<sid>")` lever (Studies_Ledger row, anniversary, Workpaper Index skeleton, FROZEN); `weeklyReview()` five-number email; string-form date answers now parsed; same-poll Step-1/Step-2 pairs no longer create two monday items. Gmail-compose scope consented 2026-09-02.
- **Engine v1.22:** Reviewer_Review rows 31–39 (PIS date, contract date, year built, land source, 1031, prev-dep, taxpayer/entity, closing date, first tax year) with effective values feeding QC-002/012/021/023/026 and Report_Output rows 33–37. **Report script v1.32** (`_assets/build_report_v1_32.py` + validate_engine v1.32): effective dates drive bonus/convention; CPA letter + cover address the taxpayer/entity; validator finds the intake row by Project ID. Run with Python 3.12 + playwright==1.56.0.
- **Form:** q393 Personal Residence note (shown when q10 = Personal Residence, Step 1) + q25 hidden for Personal Residence; q118/q119/q169 hidden until a referral answer. Legacy forms renamed "ZZ ARCHIVED 2026-09-02 — …" (one UI Archive click still owed on 261878473886176). Autoresponder cannot be edited by API (emails array is a full replace; 8 KB URL cap) — UI only.
- **Site:** `/qq-x7k4` gated behind the admin code (SHA-256 in page JS, sessionStorage flag; commit f2be43a); root-river FAQ/intro fixed (3b235e6).
- **Live E2E proof 2026-09-02:** API-created Step-1 + Step-2 test submissions built a P-folder + engine copy in one poll, CU–DD populated, Septic/Well evidence-led, monday lead Ordered with test-lane evidence, M1 dry-run logged; found and fixed the two PR #5 defects; test artifacts cleaned up (ledger rows SKIP, Leads rows kept as TEST_CLEANED_UP so the router never re-routes them, monday items archived, submissions deleted; two admin@-owned test P-folders still to be trashed by an owner).
