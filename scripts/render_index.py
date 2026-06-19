#!/usr/bin/env python3
from __future__ import annotations

import json
from html import escape
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
REGISTRY = PROJECT_ROOT / "data" / "registry" / "issues.json"
TEMPLATE = PROJECT_ROOT / "templates" / "index-shell.html"
OUTPUT = PROJECT_ROOT / "public" / "index.html"
SITEMAP = PROJECT_ROOT / "public" / "sitemap.xml"


def h(value: object) -> str:
    return escape(str(value or ""), quote=True)


def href(issue: dict) -> str:
    return h(issue["href"])


def issue_label(issue: dict) -> str:
    return f"W{issue['issueNumber']}"


def render_feature(issue: dict) -> str:
    status = "test workflow" if issue.get("testMode") else "current issue"
    return f"""  <!-- Featured note -->
  <section class="feature">
    <a class='feature-card' href='{href(issue)}'>
      <div>
        <div class="lab">/ {h(status)} · {issue_label(issue)}</div>
        <h2>{h(issue["title"]).replace(issue_label(issue), f"<em>{issue_label(issue)}</em>")}</h2>
        <p>{h(issue["summary"])}</p>
        <div class="meta"><b>Published:</b> {h(issue["publishDate"])} · <b>Read:</b> {h(issue["readTime"])} · <b>Filed:</b> {' · '.join(h(topic) for topic in issue.get("topics", []))}</div>
      </div>
      <span class="feature-arrow">read &rarr;</span>
    </a>
  </section>"""


def render_card(issue: dict) -> str:
    chips = "".join(f'<span class="chip">{h(topic)}</span>' for topic in issue.get("topics", [])[:3])
    locked = " locked" if issue.get("locked") else " generated"
    return f"""    <a class='note-row' data-domain='cross' data-topics='weekly {h(" ".join(issue.get("topics", []))).lower()}' href='{href(issue)}'>
  <div class="visual"><span class="glyph">{issue_label(issue)}</span><span class="if-stamp">i</span><span class="pulse"></span><div class="yr">{h(issue["publishDate"])}</div><div class="right">{h(issue["readTime"])}</div></div>
  <div class="body">
    <div class="topics">{chips}</div>
    <h3>{h(issue["title"]).replace(issue_label(issue), f"<em>{issue_label(issue)}</em>")}</h3>
    <p>{h(issue["summary"])}<span style="display:none">{locked}</span></p>
  </div>
</a>"""


def render_timeline(issues: list[dict]) -> str:
    cards = "\n".join(render_card(issue) for issue in sorted(issues, key=lambda item: item["issueNumber"], reverse=True))
    first = min(issue["issueNumber"] for issue in issues)
    last = max(issue["issueNumber"] for issue in issues)
    return f"""  <!-- Timeline -->
  <section class="timeline">
    <div class="tl-h">/ Weekly issue archive · W{first}-W{last}</div>
    <div class="gallery">
{cards}
    </div>
  </section>"""


def render_index() -> str:
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    issues = [issue for issue in registry["issues"] if not issue.get("testMode")]
    if not issues:
        raise RuntimeError("No public issues available for index generation.")
    latest = max(issues, key=lambda item: item["issueNumber"])
    shell = TEMPLATE.read_text(encoding="utf-8")

    start = shell.index("  <!-- Featured note -->")
    end = shell.index("</div>\n\n</main>", start)
    dynamic = "\n\n".join([render_feature(latest), render_timeline(issues)])
    html = shell[:start] + dynamic + "\n" + shell[end:]
    html = html.replace("six-issue archive", f"W19-W{latest['issueNumber']} archive")
    html = html.replace("showing six weekly issues and the current W24 issue", f"showing weekly issues and the current {issue_label(latest)} issue")
    html = html.replace(">W24</text>", f">{issue_label(latest)}</text>")
    html = html.replace(">current</text>", ">current</text>")
    html = html.replace("W24 · 8-13 June 2026", f"{issue_label(latest)} · {h(latest['coverage'])}")
    html = html.replace("href='/2026-06-15_weekly-w24'", f"href='{href(latest)}'")
    html = html.replace("Archive: W19-W24", f"Archive: W19-W{latest['issueNumber']}")
    return html


def render_sitemap() -> str:
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    base = registry["publicSite"]["canonicalUrl"].rstrip("/")
    issues = sorted(
        [issue for issue in registry["issues"] if not issue.get("testMode")],
        key=lambda item: item["issueNumber"],
    )
    if not issues:
        raise RuntimeError("No public issues available for sitemap generation.")
    rows = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for issue in issues:
        rows.append(
            f'  <url><loc>{base}/{h(issue["href"])}</loc><lastmod>{h(issue["publishDate"])}</lastmod></url>'
        )
    latest = max(issues, key=lambda item: item["issueNumber"])
    rows.append(f'  <url><loc>{base}/</loc><lastmod>{h(latest["publishDate"])}</lastmod></url>')
    rows.append("</urlset>")
    return "\n".join(rows) + "\n"


def main() -> None:
    OUTPUT.write_text(render_index(), encoding="utf-8")
    SITEMAP.write_text(render_sitemap(), encoding="utf-8")
    print(OUTPUT)
    print(SITEMAP)


if __name__ == "__main__":
    main()
