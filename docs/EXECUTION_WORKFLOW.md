# Weekly Signals Execution Workflow

## Domain Model

`weeklysignals.ifeed.ie` is the public combined site. It should show W19-W24 and W25 onward as one continuous Weekly Signals product.

`signal19-24.ifeed.ie` can be used later as an archive/source domain for the locked W19-W24 pages.

`signal.ifeed.ie` can be used later as the W25 onward CMS/current-system domain.

For now, the safest setup is one deploy output:

```text
public/
```

## Source Layers

```text
archive-static/       locked W19-W24 source copies
templates/            design/template references
data/weeks/           W25 onward weekly JSON files
data/registry/        index, domain, dependency, and issue registry
scripts/              build and validation tools
public/               generated deploy output
```

## Weekly Workflow

1. Create the next week file.

```bash
python3 scripts/new_week.py 2026-W26 --blank
```

2. Fill the nine signal records in:

```text
data/weeks/2026-W26.json
```

3. Add the issue card metadata in:

```text
data/registry/issues.json
```

4. Build everything.

```bash
python3 scripts/build_all.py
```

5. Check:

```text
public/2026-06-29_weekly-w26.html
public/index.html
public/sitemap.xml
```

6. Commit and deploy through Git/Netlify.

## Change Control

Routine weekly change:

```text
data/weeks/YYYY-WXX.json
data/registry/issues.json
```

Template/design change:

```text
templates/week23-standard.html
scripts/render_week.py
```

Public index design change:

```text
templates/index-shell.html
scripts/render_index.py
```

Dependency change:

```text
data/registry/dependencies.json
netlify.toml
```

The operating rule is simple: content can move fast, templates move carefully.
