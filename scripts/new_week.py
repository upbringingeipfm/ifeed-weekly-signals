#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from copy import deepcopy
from datetime import date, timedelta
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
WEEKS_DIR = PROJECT_ROOT / "data" / "weeks"


def iso_monday(year: int, week: int) -> date:
    return date.fromisocalendar(year, week, 1)


def blank_signal(number: int, week_label: str) -> dict:
    return {
        "number": number,
        "id": f"{week_label.lower()}-signal-{number:02d}",
        "lane": "",
        "horizon": "",
        "title": "",
        "cardFact": "",
        "whyItMatters": "",
        "sourceTitle": "",
        "sourceUrl": "",
        "sourceDate": "",
        "sourceType": "",
        "expandedSummary": "",
        "tiles": [
            {"label": "Why it matters", "text": ""},
            {"label": "Governance implication", "text": ""},
            {"label": "Market / AI implication", "text": ""}
        ],
        "visual": {
            "title": "",
            "nodes": [
                {"label": "Source", "text": ""},
                {"label": "Signal", "text": ""},
                {"label": "Operating layer", "text": ""},
                {"label": "Decision", "text": ""}
            ],
            "footer": ""
        },
        "claimBoundary": ""
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a new iFeed Weekly Signals JSON file.")
    parser.add_argument("week", help="ISO week label, for example 2026-W26")
    parser.add_argument("--from", dest="source_week", default="2026-W25", help="Source week to clone metadata shape from")
    parser.add_argument("--blank", action="store_true", help="Create blank signals instead of cloning signal content")
    args = parser.parse_args()

    year_text, week_text = args.week.split("-W", 1)
    year = int(year_text)
    week = int(week_text)
    monday = iso_monday(year, week)
    sunday = monday + timedelta(days=6)
    output = WEEKS_DIR / f"{args.week}.json"
    if output.exists():
        raise SystemExit(f"Refusing to overwrite existing file: {output}")

    source = WEEKS_DIR / f"{args.source_week}.json"
    if source.exists():
        data = json.loads(source.read_text(encoding="utf-8"))
    else:
        data = {"schemaVersion": "0.1.0", "testMode": True, "issue": {}, "workflow": {}, "signals": []}

    data = deepcopy(data)
    issue_number = week
    slug = f"{monday.isoformat()}_weekly-w{issue_number}"
    data["testMode"] = True
    data["issue"].update({
        "week": args.week,
        "issueNumber": issue_number,
        "slug": slug,
        "outputFile": f"{slug}.html",
        "publishDate": monday.isoformat(),
        "coverage": {
            "start": monday.isoformat(),
            "end": sunday.isoformat(),
            "actualEnd": ""
        },
        "title": f"W{issue_number}: draft weekly signal issue.",
        "theme": "Draft weekly signal theme",
        "dek": "Draft issue generated from the iFeed Weekly Signals CMS workflow.",
        "lede": "Replace this lede with the weekly editorial frame after selecting the final nine source-backed signals.",
        "canonicalUrl": f"https://weeklysignals.ifeed.ie/{slug}.html",
        "referenceTemplate": "week23-standard"
    })
    data["workflow"] = {
        "status": "draft",
        "sourceChecked": False,
        "claimChecked": False,
        "editorApproved": False,
        "publishApproved": False,
        "notes": "Created by scripts/new_week.py"
    }
    if args.blank or len(data.get("signals", [])) != 9:
        data["signals"] = [blank_signal(i, args.week) for i in range(1, 10)]
    else:
        for i, signal in enumerate(data["signals"], start=1):
            signal["number"] = i
            signal["id"] = f"{args.week.lower()}-signal-{i:02d}"
            signal["sourceDate"] = ""
            signal["sourceTitle"] = ""
            signal["sourceUrl"] = ""
            signal["sourceType"] = ""
            signal["claimBoundary"] = ""

    output.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(output)


if __name__ == "__main__":
    main()
