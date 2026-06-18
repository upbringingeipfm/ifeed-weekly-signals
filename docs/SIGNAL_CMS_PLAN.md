# signal.ifeed.ie / weeklysignals.ifeed.ie CMS Plan

Created: 2026-06-18

## Goal

Create a separate Weekly Signals content-management project that can publish future weekly issues without hand-building each HTML page.

Current public URL in Netlify:

```text
weeklysignals.ifeed.ie
```

User shorthand:

```text
signal.ifeed.ie
```

Recommended operating split:

```text
weeklysignals.ifeed.ie   public combined archive and current weekly issues
signal19-24.ifeed.ie     optional locked W19-W24 archive/source domain
signal.ifeed.ie          optional W25 onward CMS/current-system domain
```

The actual deployable output remains one combined static site in `public/` unless there is a strong reason to split Netlify projects later.

## What Stays Static

These are stable site assets and previous public pages:

```text
archive-static/2026-05-11_weekly-w19.html
archive-static/2026-05-18_weekly-w20.html
archive-static/2026-05-25_weekly-w21.html
archive-static/2026-06-01_weekly-w22.html
archive-static/2026-06-08_weekly-w23.html
archive-static/2026-06-15_weekly-w24.html
public/2026-05-11_weekly-w19.html
public/2026-05-18_weekly-w20.html
public/2026-05-25_weekly-w21.html
public/2026-06-01_weekly-w22.html
public/2026-06-08_weekly-w23.html
public/2026-06-15_weekly-w24.html
public/theme.css
public/mark.css
public/site.js
public/favicon.svg
public/robots.txt
public/sitemap.xml
```

Rule:

W19-W24 are archive pages. Do not rewrite them during the W25 CMS pilot.

## What Becomes Data

Every future weekly issue should be stored as JSON first:

```text
data/weeks/2026-W25.json
```

The public archive/index is controlled by:

```text
data/registry/issues.json
```

The dependency map is controlled by:

```text
data/registry/dependencies.json
```

Changing weekly fields:

- week
- slug
- publish date
- coverage start/end
- issue title
- issue theme
- issue lede
- 9 selected signals
- source ledger
- QA status

Signal-level data:

- number
- lane/domain
- short card label
- public headline
- fact
- why it matters
- source title
- source URL
- source date
- source type
- expanded summary
- practical tiles
- Monday move
- claim boundary
- visual nodes

## What Becomes Generated Static Output

The renderer converts:

```text
data/weeks/2026-W25.json
```

into:

```text
public/2026-06-22_weekly-w25.html
```

The output is still a static page, so Netlify can host it cheaply and reliably.

## Frontend, Backend, Database

### Frontend

Static HTML/CSS/JS:

```text
admin/index.html
public/*.html
```

### Backend

Phase 1:

No backend. JSON export/import only.

Phase 2:

GitHub write workflow or Netlify Function.

### Database

Phase 1:

JSON files in Git:

```text
data/weeks/*.json
data/sources/*.json
```

Phase 2:

Optional Netlify Database for:

- review queue
- selections
- editorial notes
- activity log
- user settings

Do not store public content only in Netlify Database yet. Public content should stay in Git-backed JSON so it remains portable and recoverable.

## Week 23 Standard

Week 23 remains the reference standard:

- 9 source-backed signals
- compact signal grid
- expandable signal brief
- source ledger
- strong claim boundaries
- practical operating interpretation

W25 pilot uses the same editorial structure, but generated from data.

## Real Weekly Workflow

1. Add raw signal candidates to research/private dashboard.
2. Verify sources.
3. Select final 9.
4. Edit `data/weeks/2026-W25.json`.
5. Run renderer.
6. Check generated `public/2026-06-22_weekly-w25.html`.
7. Update `data/registry/issues.json`.
8. Run `python3 scripts/build_all.py` to generate the issue page, index, and sitemap.
9. Commit.
10. Deploy to Netlify staging/preview.
11. Promote to production.

## What You Change Every Week

Usually only this file:

```text
data/weeks/YYYY-WXX.json
```

Fields to update:

```text
issue.week
issue.slug
issue.publishDate
issue.coverage.start
issue.coverage.end
issue.title
issue.theme
issue.lede
signals[0..8]
qa.*
```

Then run:

```text
python3 scripts/build_all.py
```

## W25 Status

W25 is a test issue. Its 9 signals are marked as test records, not final verified editorial selections.
