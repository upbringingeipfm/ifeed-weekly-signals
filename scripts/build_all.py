#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
REGISTRY = PROJECT_ROOT / "data" / "registry" / "issues.json"


def run(args: list[str]) -> None:
    subprocess.run(args, cwd=PROJECT_ROOT, check=True)


def main() -> None:
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    for issue in registry["issues"]:
        source = issue.get("source", "")
        if source.startswith("data/weeks/"):
            run([sys.executable, "scripts/render_week.py", source])
    run([sys.executable, "scripts/render_index.py"])


if __name__ == "__main__":
    main()
