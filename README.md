# iFeed Weekly Signals CMS

Separate project for `weeklysignals.ifeed.ie` / future `signal.ifeed.ie`.

## Structure

```text
public/                 combined static deploy for weeklysignals.ifeed.ie
archive-static/         locked W19-W24 archive source
data/weeks/             W25 onward issue JSON files
data/registry/          issue registry and dependency map
templates/              locked design/template references
admin/                  browser editor
scripts/                render/build tools
docs/                   operating documentation
```

## Current Rule

W19-W24 remain static archive pages. W25 onward is data-driven.

## Build Everything

```bash
python3 scripts/build_all.py
```

Outputs:

```text
public/index.html
public/2026-06-22_weekly-w25.html
public/sitemap.xml
```

## Create A New Week

```bash
python3 scripts/new_week.py 2026-W26 --blank
```

Then edit:

```text
data/weeks/2026-W26.json
data/registry/issues.json
```

and run `python3 scripts/build_all.py`.
