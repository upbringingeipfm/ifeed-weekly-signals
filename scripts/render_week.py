#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from html import escape
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = PROJECT_ROOT / "public"
W23_TEMPLATE = PUBLIC_DIR / "2026-06-08_weekly-w23.html"


def h(value: object) -> str:
    return escape(str(value or ""), quote=True)


def em_title(value: object) -> str:
    text = h(value)
    replacements = [
        ("controlled work", "<em>controlled work</em>"),
        ("operating file", "<em>operating file</em>"),
        ("management system", "<em>management system</em>"),
        ("evidence trail", "<em>evidence trail</em>"),
    ]
    for plain, marked in replacements:
        text = text.replace(plain, marked)
    return text


def template_style() -> str:
    text = W23_TEMPLATE.read_text(encoding="utf-8")
    match = re.search(r"<style>.*?</style>", text, flags=re.S)
    if not match:
        raise RuntimeError(f"Could not find Week 23 style block in {W23_TEMPLATE}")
    return match.group(0)


def template_runtime_script() -> str:
    text = W23_TEMPLATE.read_text(encoding="utf-8")
    match = re.search(r"<script>\s*\(function \(\).*?</script>", text, flags=re.S)
    if not match:
        raise RuntimeError(f"Could not find Week 23 interaction script in {W23_TEMPLATE}")
    return match.group(0)


def render_nav(issue: dict) -> str:
    return f"""
<nav class="nav" aria-label="iFeed weekly navigation">
  <div class="nav-inner">
    <a class='brand' href='https://ifeed.ie/'>
      <div class="nn11"><svg viewBox="0 0 100 80" style="width:100%;height:auto;display:block;overflow:visible" aria-label="iFeed mark">
        <g class="nerve">
          <line x1="20" y1="20" x2="50" y2="20"/><line x1="20" y1="20" x2="50" y2="40"/><line x1="20" y1="20" x2="50" y2="60"/>
          <line x1="20" y1="40" x2="50" y2="20"/><line x1="20" y1="40" x2="50" y2="40"/><line x1="20" y1="40" x2="50" y2="60"/>
          <line x1="20" y1="60" x2="50" y2="20"/><line x1="20" y1="60" x2="50" y2="40"/><line x1="20" y1="60" x2="50" y2="60"/>
          <line x1="50" y1="20" x2="80" y2="40"/><line x1="50" y1="40" x2="80" y2="40"/><line x1="50" y1="60" x2="80" y2="40"/>
        </g>
        <circle class="neuron-in" cx="20" cy="20" r="3.6"/><circle class="neuron-in" cx="20" cy="40" r="3.6"/><circle class="neuron-in" cx="20" cy="60" r="3.6"/>
        <circle class="neuron-mid" cx="50" cy="20" r="3.2"/><circle class="neuron-mid" cx="50" cy="40" r="3.2"/><circle class="neuron-mid" cx="50" cy="60" r="3.2"/>
        <circle class="halo-ring halo-a" cx="80" cy="40" r="6"/><circle class="halo-ring halo-b" cx="80" cy="40" r="7.5"/>
        <circle class="neuron-out" cx="80" cy="40" r="4.4"/>
      </svg></div>
      <span class="if-mark sm"><span class="i">i</span>Feed</span>
    </a>
    <div class="nav-title" id="w22-nav-title">
      <div class="head" id="w22-nav-head">{h(issue.get("week"))} · <em>{h(issue.get("theme"))}</em></div>
    </div>
    <div class="nav-right">
      <div class="theme-toggle" role="group" aria-label="theme toggle">
        <button type="button" id="t-light" class="active" aria-label="light theme">Light</button>
        <button type="button" id="t-dark" aria-label="dark theme">Dark</button>
      </div>
      <button type="button" class="w20-hamburger" id="w20-hamburger" aria-label="open menu" aria-expanded="false"><span></span></button>
    </div>
    <div class="links">
      <a href='https://ifeed.ie/'>Home</a>
      <a href="https://ifeed.ie/methodology.html">Methodology</a>
      <a href="https://library.ifeed.ie/">Library</a>
      <a href="https://regulations.ifeed.ie/">Regulations</a>
      <a href="https://ifeed.ie/services.html">Collaborate</a>
      <a href="https://ai.ifeed.ie/">AI</a>
      <a class='current' href='/'>Signals</a>
      <a href="https://ifeed.ie/academy.html">Academy</a>
      <a href="https://ifeed.ie/community.html">Community</a>
      <a href="https://ifeed.ie/founder.html">Founder</a>
      <a href="https://ifeed.ie/connect.html">Connect</a>
      <a href="https://ifeed.ie/register.html">Register</a>
    </div>
  </div>
</nav>
<aside class="w20-drawer-backdrop" id="w20-drawer-backdrop"></aside>
<aside class="w20-drawer" id="w20-drawer" aria-hidden="true">
  <button type="button" class="close" id="w20-drawer-close" aria-label="close menu">×</button>
  <a href='https://ifeed.ie/'>Home</a>
  <a href="https://ifeed.ie/methodology.html">Methodology</a>
  <a href="https://library.ifeed.ie/">Library</a>
  <a href="https://regulations.ifeed.ie/">Regulations</a>
  <a href="https://ifeed.ie/services.html">Collaborate</a>
  <a href="https://ai.ifeed.ie/">AI</a>
  <a class='current' href='/'>Signals</a>
  <a href="https://ifeed.ie/academy.html">Academy</a>
  <a href="https://ifeed.ie/community.html">Community</a>
  <a href="https://ifeed.ie/founder.html">Founder</a>
  <a href="https://ifeed.ie/connect.html">Connect</a>
  <a href="https://ifeed.ie/register.html">Register</a>
</aside>"""


def render_test_banner(issue_data: dict) -> str:
    if not issue_data.get("testMode"):
        return ""
    return """
<div class="test-banner" style="width:min(1250px,calc(100% - 24px));margin:16px auto 0;border:1px solid #c45e3e;color:#8d2d1f;background:#f9e8e4;border-radius:10px;padding:12px 16px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;">
  TEST ISSUE · Generated from JSON for workflow validation. Replace placeholder signals before public publication.
</div>"""


def render_hero(issue: dict, signals: list[dict]) -> str:
    coverage = issue.get("coverage", {})
    return f"""
  <section class="hero" aria-labelledby="weekly-title">
    <div>
      <div class="eyebrow">{h(issue.get("publishDate"))} · Weekly · {h(issue.get("week"))}</div>
      <h1 id="weekly-title">{em_title(issue.get("title"))}</h1>
      <p class="lede">{h(issue.get("lede"))}</p>
      <div class="hero-metadata" aria-label="Digest status">
        <div class="metric"><div class="label">Coverage</div><div class="value">{h(coverage.get("start"))} → {h(coverage.get("end"))}</div></div>
        <div class="metric"><div class="label">Signals</div><div class="value">{len(signals)} selected</div></div>
        <div class="metric"><div class="label">Template</div><div class="value">Week 23 standard</div></div>
      </div>
    </div>

    <aside class="signal-map signal-register" aria-label="{h(issue.get("week"))} decision register">
      <div class="register-head">
        <div>
          <div class="register-kicker">{h(issue.get("week"))} decision register</div>
          <h2>{h(issue.get("theme"))}</h2>
          <p>{h(issue.get("dek"))}</p>
        </div>
        <div class="register-count">{len(signals)} signals</div>
      </div>
      <div class="register-lanes">
        {render_register_lanes(signals)}
      </div>
      <div class="register-trust" aria-label="Source mix">
        <span>JSON controlled</span>
        <span>source ledger</span>
        <span>review workflow</span>
      </div>
    </aside>
  </section>"""


def render_register_lanes(signals: list[dict]) -> str:
    groups = [
        ("Governance and evidence", signals[:3]),
        ("Operations and access", signals[3:6]),
        ("Infrastructure and system", signals[6:]),
    ]
    html = []
    for title, group in groups:
        rows = "\n".join(
            f'<div class="register-row"><b>{h(signal.get("lane"))}</b><span>{h(signal.get("title"))}</span></div>'
            for signal in group
        )
        html.append(f'<div class="register-lane"><div class="lane-k">{h(title)}</div>{rows}</div>')
    return "\n".join(html)


def render_thesis(issue: dict) -> str:
    return f"""
  <div class="section-label">The Analyst Frame</div>
  <section class="thesis-strip" aria-label="Weekly thesis">
    <article class="thesis-card"><div class="k">What changed</div><p>{h(issue.get("theme"))}</p></article>
    <article class="thesis-card"><div class="k">What it means</div><p>Each weekly signal is now a controlled record with source, decision relevance, claim boundary, and operating implication.</p></article>
    <article class="thesis-card"><div class="k">iFeed edge</div><p>The digest can be generated from data while keeping the public Week 23 reading experience intact.</p></article>
  </section>"""


def render_signal_card(signal: dict) -> str:
    number = int(signal["number"])
    title = em_title(signal.get("title"))
    source = h(signal.get("sourceTitle"))
    return f"""
    <article class="signal-card" role="button" tabindex="0" data-slide="slide-{number:02d}" aria-label="Open {source} signal brief">
      <div class="signal-top"><div class="signal-num">{number:02d}</div><div class="horizon now">{h(signal.get("horizon"))}</div></div>
      <h2>{title}</h2>
      <p class="fact">{h(signal.get("cardFact"))}</p>
      <div class="decision-box"><div class="decision-label">Decision relevance</div><p>{h(signal.get("whyItMatters"))}</p></div>
      <div class="source-line">{h(signal.get("sourceType"))} · {h(signal.get("sourceDate"))} · {source} · <a href="{h(signal.get("sourceUrl"))}">Source</a></div>
      <div class="open-slide">Read signal brief →</div>
    </article>"""


def render_signal_grid(signals: list[dict], issue: dict) -> str:
    cards = "\n".join(render_signal_card(signal) for signal in signals)
    return f"""
  <div id="signals" class="section-label">Nine Decision Signals</div>
  <section class="signal-grid" aria-label="{h(issue.get("week"))} signal cards">
{cards}
  </section>"""


def split_paragraphs(value: object) -> str:
    text = str(value or "")
    chunks = [chunk.strip() for chunk in text.split("\n") if chunk.strip()] or [text]
    return "\n".join(f"        <p>{h(chunk)}</p>" for chunk in chunks)


def render_expanded(signal: dict) -> str:
    number = int(signal["number"])
    tiles = "\n".join(
        f'          <div class="exp-tile"><strong>{h(tile.get("label"))}</strong><span>{h(tile.get("text"))}</span></div>'
        for tile in signal.get("tiles", [])
    )
    takeaways = "\n".join(
        f'          <span>{h(tile.get("text"))}</span>'
        for tile in signal.get("tiles", [])
    )
    nodes = "\n".join(
        f'          <div class="stack-layer"><b>{i:02d} {h(node.get("label"))}</b><span>{h(node.get("text"))}</span></div>'
        for i, node in enumerate(signal.get("visual", {}).get("nodes", []), start=1)
    )
    return f"""
    <article class="carousel-slide" id="slide-{number:02d}">
      <div class="slide-copy">
        <div class="slide-kicker">Signal {number:02d} of 09 · {h(signal.get("lane"))} · {h(signal.get("sourceTitle"))}</div>
        <h2>{em_title(signal.get("title"))}</h2>
        <div class="slide-summary">
{split_paragraphs(signal.get("expandedSummary"))}
        </div>
        <div class="slide-meta-grid">
          <div class="slide-meta"><div class="m-label">Source</div><div class="m-value">{h(signal.get("sourceTitle"))}</div></div>
          <div class="slide-meta"><div class="m-label">Date</div><div class="m-value">{h(signal.get("sourceDate"))}</div></div>
          <div class="slide-meta"><div class="m-label">Source Type</div><div class="m-value">{h(signal.get("sourceType"))}</div></div>
        </div>
        <div class="slide-explainer">
{tiles}
        </div>
        <div class="slide-takeaways">
          <strong>Reader takeaways</strong>
{takeaways}
        </div>
        <div class="slide-terms">
          <strong>Claim boundary</strong>
          <span>{h(signal.get("claimBoundary"))}</span>
        </div>
        <a class="slide-source" href="{h(signal.get("sourceUrl"))}">View source ↗</a>
      </div>
      <div class="visual-card v-diagram v-qmsr" data-insight="{h(signal.get("whyItMatters"))}" aria-hidden="true">
        <div class="diagram-kicker">{h(signal.get("lane"))}</div>
        <div class="stack-board">
{nodes}
        </div>
      </div>
    </article>"""


def render_expanded_deck(signals: list[dict]) -> str:
    slides = "\n".join(render_expanded(signal) for signal in signals)
    return f"""
  <section class="expanded" id="expanded" aria-live="polite">
    <button type="button" class="exp-close" id="exp-close" aria-label="close expanded signal">×</button>
    <div id="expanded-content"></div>
  </section>

  <div class="section-label source-only-label">Expanded Signal Briefs</div>
  <section class="carousel-deck" aria-label="Expanded signal briefs">
{slides}
  </section>"""


def render_readout(issue: dict) -> str:
    return f"""
  <section class="readout" aria-label="iFeed weekly synthesis">
    <article class="readout-panel">
      <h2>The readout: <em>structured intelligence is becoming the product.</em></h2>
      <p>This generated issue proves the core management-system move: the static public page can be rebuilt from a controlled data file while staying aligned to the Week 23 public template.</p>
      <p>For real publication, replace the test records with verified sources, run the renderer, review the page, commit, and deploy.</p>
    </article>
    <article class="pipeline-panel" id="regulations">
      <h2>How this ladders into <em>iFeed work</em>.</h2>
      <p>{h(issue.get("dek"))}</p>
      <div class="pipeline-list">
        <div class="pipeline-item"><strong>Weekly 9</strong><span>Final source-backed issue for public reading and sharing</span></div>
        <div class="pipeline-item"><strong>Evidence layer</strong><span>Each signal links to its source and states the operating implication</span></div>
        <div class="pipeline-item"><strong>CMS layer</strong><span>Changing weekly content lives in JSON, not hand-edited page sections</span></div>
        <div class="pipeline-item"><strong>Deploy route</strong><span>Render HTML, commit to Git, deploy on Netlify</span></div>
      </div>
    </article>
  </section>"""


def render_source_row(signal: dict) -> str:
    return f"""
    <div class="source-row"><div>{h(signal.get("lane"))}</div><div><a href="{h(signal.get("sourceUrl"))}">{h(signal.get("sourceTitle"))}</a></div><div>{h(signal.get("sourceDate"))}</div><div>{h(signal.get("sourceType"))}</div></div>"""


def render_sources(signals: list[dict]) -> str:
    rows = "\n".join(render_source_row(signal) for signal in signals)
    return f"""
  <div id="source-ledger" class="section-label source-ledger-label">Source Ledger</div>
  <section class="source-table" aria-label="Source ledger">
    <div class="source-row header"><div>Signal</div><div>Source</div><div>Date</div><div>Class</div></div>
{rows}
  </section>"""


def render_issue(issue_data: dict) -> str:
    issue = issue_data["issue"]
    signals = issue_data["signals"]
    robots = "noindex, follow" if issue_data.get("testMode") else "index, follow"
    body = "\n".join(
        [
            render_nav(issue),
            render_test_banner(issue_data),
            '<main class="page">',
            render_hero(issue, signals),
            render_thesis(issue),
            render_signal_grid(signals, issue),
            render_expanded_deck(signals),
            render_readout(issue),
            render_sources(signals),
            f"  <footer>iFeed Weekly · Sunita Nawale · data-backed analyst note · {h(issue.get('week'))}</footer>",
            "</main>",
            template_runtime_script(),
        ]
    )

    return f"""<!doctype html>
<html lang="en" data-theme="light" class="w20-page w21-signal-room w22-evidence-release">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
<meta name="robots" content="{robots}" />
<title>iFeed Weekly · W{h(issue.get("issueNumber"))} · {h(issue.get("theme"))}</title>
<meta name="description" content="{h(issue.get("dek"))}" />
<meta property="og:type" content="article" />
<meta property="og:title" content="iFeed Weekly · W{h(issue.get("issueNumber"))} · {h(issue.get("theme"))}" />
<meta property="og:description" content="{h(issue.get("dek"))}" />
<meta property="og:url" content="{h(issue.get("canonicalUrl"))}" />
<meta property="og:image" content="https://ifeed.ie/favicon.svg" />
<meta property="og:site_name" content="iFeed" />
<meta property="og:locale" content="en_IE" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="iFeed Weekly · W{h(issue.get("issueNumber"))} · {h(issue.get("theme"))}" />
<meta name="twitter:description" content="{h(issue.get("dek"))}" />
<meta name="twitter:image" content="https://ifeed.ie/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500;1,6..72,600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="theme.css?v=20260504au" />
<link rel="stylesheet" href="mark.css?v=20260504au" />
<link rel="canonical" href="{h(issue.get("canonicalUrl"))}" />
<script src="site.js?v=20260504au" defer></script>
{template_style()}
</head>
<body>
{body}
</body>
</html>
"""


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: render_week.py data/weeks/YYYY-WXX.json")
    input_path = (PROJECT_ROOT / sys.argv[1]).resolve()
    if not input_path.exists():
        raise SystemExit(f"Missing issue file: {input_path}")
    data = json.loads(input_path.read_text(encoding="utf-8"))
    signals = data.get("signals", [])
    if len(signals) != 9:
        raise SystemExit(f"Expected exactly 9 signals, got {len(signals)}")
    output_file = data["issue"]["outputFile"]
    output_path = PUBLIC_DIR / output_file
    output_path.write_text(render_issue(data), encoding="utf-8")
    print(output_path)


if __name__ == "__main__":
    main()
