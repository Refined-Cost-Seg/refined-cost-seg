#!/usr/bin/env python3
"""
Splice new journal posts into the two index surfaces that are too large to
re-emit safely through an API client: journal/index.html and index.html.

How it works
------------
A publisher commits the post itself (journal/<slug>.html), the sitemap entry,
and a small hand-off file journal/_inbox/<slug>.json:

    {
      "slug": "rental-placed-in-service-date",
      "title": "Your rental's placed-in-service date is not your closing date.",
      "excerpt": "Closing settles ownership; it doesn't start depreciation. ...",
      "tag": "Tax strategy",
      "datePublished": "2026-09-09",
      "svg": "<svg ...>...</svg>"          # optional card art; newest card's art is reused if absent
    }

This script (run by .github/workflows/splice-posts.yml on push) then:
  * inserts a .blog-card at the top of journal/index.html's .listing-grid and a
    BlogPosting entry at the top of its Blog JSON-LD blogPost array;
  * inserts a featured card at the top of the homepage #journal .blog-grid,
    demotes the previous feature card, and trims the grid back to three;
  * makes sure sitemap.xml lists the post and bumps lastmod on / and /journal/;
  * deletes the inbox file it consumed.

Everything is idempotent: a post already linked on a surface is left alone.
Every edit is validated before anything is written; a failed validation
leaves the working tree untouched and exits non-zero so the Action fails loudly.
"""
import datetime as dt
import glob
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOURNAL_INDEX = os.path.join(ROOT, "journal", "index.html")
HOME_INDEX = os.path.join(ROOT, "index.html")
SITEMAP = os.path.join(ROOT, "sitemap.xml")
INBOX = os.path.join(ROOT, "journal", "_inbox")
SITE = "https://www.refinedcostseg.com"


class SpliceError(Exception):
    pass


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def write(p, s):
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)


def esc(s):
    """HTML-escape plain text the way the existing cards are written."""
    s = html.escape(s, quote=False)
    return (s.replace("’", "&rsquo;").replace("‘", "&lsquo;")
             .replace("“", "&ldquo;").replace("”", "&rdquo;")
             .replace("—", "&mdash;").replace("–", "&ndash;"))


def long_date(d):   # September 9, 2026
    return f"{d.strftime('%B')} {d.day}, {d.year}"


def short_date(d):  # 9 Sep 2026
    return f"{d.day} {d.strftime('%b')} {d.year}"


def load_inbox():
    items = []
    for p in sorted(glob.glob(os.path.join(INBOX, "*.json"))):
        if os.path.basename(p).startswith("_"):
            continue
        try:
            d = json.loads(read(p))
        except json.JSONDecodeError as e:
            raise SpliceError(f"{p}: not valid JSON ({e})")
        for k in ("slug", "title", "excerpt", "datePublished"):
            if not d.get(k) or not isinstance(d[k], str):
                raise SpliceError(f"{p}: missing or empty '{k}'")
        slug = d["slug"].strip()
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            raise SpliceError(f"{p}: slug '{slug}' is not a clean lowercase-hyphen slug")
        if not os.path.exists(os.path.join(ROOT, "journal", slug + ".html")):
            raise SpliceError(f"{p}: journal/{slug}.html does not exist — the post must land first")
        try:
            d["_date"] = dt.date.fromisoformat(d["datePublished"][:10])
        except ValueError:
            raise SpliceError(f"{p}: datePublished '{d['datePublished']}' is not YYYY-MM-DD")
        d["slug"] = slug
        d["tag"] = (d.get("tag") or "Tax strategy").strip()
        d["_path"] = p
        items.append(d)
    items.sort(key=lambda x: (x["_date"], x["slug"]))   # oldest first, so the newest ends up on top
    return items


# ---------------------------------------------------------------- journal index
CARD_RE = re.compile(r'<a href="/journal/[^"]+" class="blog-card">.*?</a>', re.S)


def newest_svg(grid_html):
    m = re.search(r'<div class="img-frame">(<svg.*?</svg>)</div>', grid_html, re.S)
    if not m:
        raise SpliceError("journal/index.html: could not find an existing card's SVG to reuse")
    return m.group(1)


def splice_journal_index(h, post):
    href = f'/journal/{post["slug"]}.html'
    if f'href="{href}"' in h:
        return h, False
    gi = h.find('<div class="listing-grid">')
    if gi < 0:
        raise SpliceError("journal/index.html: <div class=\"listing-grid\"> not found")
    grid_open_end = gi + len('<div class="listing-grid">')
    svg = post.get("svg") or newest_svg(h[gi:])
    if not (svg.startswith("<svg") and svg.rstrip().endswith("</svg>")):
        raise SpliceError(f"{post['_path']}: svg must be a single <svg>…</svg> element")
    card = (
        f'\n      <a href="{href}" class="blog-card">\n'
        f'         <div class="img-frame">{svg}</div>\n'
        f'         <div class="blog-body"><div class="blog-meta"><span class="blog-tag">{esc(post["tag"])}</span>'
        f'<span class="blog-date">{long_date(post["_date"])}</span></div>'
        f'<h3>{esc(post["title"])}</h3><p class="excerpt">{esc(post["excerpt"])}</p>'
        f'<span class="read">Read the essay &rarr;</span></div>\n'
        f'      </a>'
    )
    h = h[:grid_open_end] + card + h[grid_open_end:]

    # JSON-LD: prepend a BlogPosting to the Blog's blogPost array, leaving the rest of the block untouched.
    m = re.search(r'(<script type="application/ld\+json">)(.*?)(</script>)', h, re.S)
    if not m:
        raise SpliceError("journal/index.html: JSON-LD block not found")
    block = m.group(2)
    try:
        ld = json.loads(block)
    except json.JSONDecodeError as e:
        raise SpliceError(f"journal/index.html: existing JSON-LD does not parse ({e})")
    if ld.get("@type") != "Blog" or not isinstance(ld.get("blogPost"), list):
        raise SpliceError("journal/index.html: JSON-LD is not a Blog with a blogPost array")
    entry = {
        "@type": "BlogPosting",
        "headline": post["title"],
        "url": f"{SITE}{href}",
        "datePublished": post["_date"].isoformat() + "T12:00:00Z",
        "author": {"@type": "Organization", "name": "Refined Cost Segregation"},
    }
    am = re.search(r'"blogPost"\s*:\s*\[', block)
    if not am:
        raise SpliceError("journal/index.html: blogPost array opener not found in JSON-LD")
    # Indentation: copy whatever the first existing entry uses.
    after = block[am.end():]
    indent_m = re.match(r'\s*\n([ \t]*)\{', after)
    indent = indent_m.group(1) if indent_m else "    "
    inner = ("\n" + indent).join(json.dumps(entry, ensure_ascii=False, indent=2).split("\n"))
    new_block = block[:am.end()] + "\n" + indent + inner + "," + block[am.end():]
    try:
        chk = json.loads(new_block)
    except json.JSONDecodeError as e:
        raise SpliceError(f"journal/index.html: JSON-LD would not parse after insertion ({e})")
    if len(chk["blogPost"]) != len(ld["blogPost"]) + 1 or chk["blogPost"][0]["url"] != entry["url"]:
        raise SpliceError("journal/index.html: JSON-LD insertion did not land where expected")
    h = h[:m.start(2)] + new_block + h[m.end(2):]
    return h, True


# ---------------------------------------------------------------- homepage
HOME_CARD_RE = re.compile(r'\s*<a href="/journal/[^"]+" class="blog-card[^"]*">.*?</a>', re.S)


def splice_home(g, post):
    href = f'/journal/{post["slug"]}.html'
    si = g.find('id="journal"')
    if si < 0:
        raise SpliceError("index.html: #journal section not found")
    gi = g.find('<div class="blog-grid">', si)
    if gi < 0:
        raise SpliceError("index.html: .blog-grid not found inside #journal")
    ge = g.find("</section>", gi)
    seg = g[gi:ge]
    if f'href="{href}"' in seg:
        return g, False
    cards = HOME_CARD_RE.findall(seg)
    if len(cards) < 1:
        raise SpliceError("index.html: no existing cards found in .blog-grid")
    svg = post.get("svg") or re.search(r'<div class="img-frame">(<svg.*?</svg>)</div>', cards[0], re.S).group(1)
    new_card = (
        f'\n        <a href="{href}" class="blog-card feature reveal">\n'
        f'          <div class="img-frame">{svg}</div>\n'
        f'          <div class="blog-body">\n'
        f'            <div class="blog-meta"><span class="blog-tag">{esc(post["tag"])}</span>'
        f'<span class="blog-date">{short_date(post["_date"])}</span></div>\n'
        f'            <h3>{esc(post["title"])}</h3>\n'
        f'            <p class="excerpt">{esc(post["excerpt"])}</p>\n'
        f'            <span class="read">Read the essay &rarr;</span>\n'
        f'          </div>\n'
        f'        </a>'
    )
    demoted = [c.replace('class="blog-card feature reveal"', 'class="blog-card reveal"', 1) for c in cards]
    kept = [new_card] + demoted[:2]          # exactly three cards on the homepage
    # Replace the run of cards inside the grid with the new run.
    first_start = seg.find(cards[0])
    last_end = seg.find(cards[-1]) + len(cards[-1])
    new_seg = seg[:first_start] + "".join(kept) + seg[last_end:]
    if len(HOME_CARD_RE.findall(new_seg)) != 3:
        raise SpliceError("index.html: homepage grid did not end up with exactly three cards")
    return g[:gi] + new_seg + g[ge:], True


# ---------------------------------------------------------------- sitemap
def splice_sitemap(x, post, today):
    loc = f"{SITE}/journal/{post['slug']}.html"
    changed = False
    if loc not in x:
        entry = (f"  <url>\n    <loc>{loc}</loc>\n    <lastmod>{post['_date'].isoformat()}</lastmod>\n"
                 f"    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n")
        ui = x.rfind("</urlset>")
        if ui < 0:
            raise SpliceError("sitemap.xml: </urlset> not found")
        x = x[:ui] + entry + x[ui:]
        changed = True
    for page in (f"{SITE}/", f"{SITE}/journal/"):
        m = re.search(r"<loc>" + re.escape(page) + r"</loc>\s*<lastmod>([^<]+)</lastmod>", x)
        if m and m.group(1) != today:
            x = x[:m.start(1)] + today + x[m.end(1):]
            changed = True
    return x, changed


# ---------------------------------------------------------------- main
def main():
    posts = load_inbox()
    if not posts:
        print("inbox empty — nothing to splice")
        return 0
    j, g, x = read(JOURNAL_INDEX), read(HOME_INDEX), read(SITEMAP)
    j0, g0, x0 = j, g, x
    today = dt.date.today().isoformat()
    consumed, report = [], []
    for p in posts:
        j, cj = splice_journal_index(j, p)
        g, cg = splice_home(g, p)
        x, cx = splice_sitemap(x, p, today)
        report.append(f"{p['slug']}: journal {'linked' if cj else 'already linked'}, "
                      f"home {'featured' if cg else 'already present'}, sitemap {'updated' if cx else 'ok'}")
        consumed.append(p["_path"])

    # Whole-file sanity before anything touches disk.
    for name, s, before in (("journal/index.html", j, j0), ("index.html", g, g0)):
        if not s.rstrip().endswith("</html>"):
            raise SpliceError(f"{name}: result does not end with </html>")
        if len(s) < len(before) - 20000:
            raise SpliceError(f"{name}: result is implausibly smaller than the original")
    if len(CARD_RE.findall(j)) != len(CARD_RE.findall(j0)) + sum(1 for r in report if "journal linked" in r):
        raise SpliceError("journal/index.html: card count did not grow by the number of posts linked")
    import xml.etree.ElementTree as ET
    ET.fromstring(x.encode("utf-8"))

    if j != j0: write(JOURNAL_INDEX, j)
    if g != g0: write(HOME_INDEX, g)
    if x != x0: write(SITEMAP, x)
    for p in consumed:
        os.remove(p)
    print("\n".join(report))
    with open(os.environ.get("GITHUB_OUTPUT", os.devnull), "a") as out:
        out.write("titles=" + " | ".join(p["title"] for p in posts) + "\n")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except SpliceError as e:
        print(f"SPLICE FAILED: {e}", file=sys.stderr)
        sys.exit(1)
