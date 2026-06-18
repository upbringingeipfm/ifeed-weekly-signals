# iFeed Weekly Signals Update Guide

This workspace keeps the published archive stable and moves each new issue into a structured data file.

## What Stays Static

- `public/2026-05-11_weekly-w19.html` through `public/2026-06-15_weekly-w24.html`
- `public/theme.css`, `public/mark.css`, `public/site.js`, `public/favicon.svg`
- The Week 23 layout pattern: hero, selected nine, expanded briefs, readout, source ledger
- The public archive until you are ready to add the new issue link

## What Becomes Weekly Data

Edit or replace one file per issue:

`data/weeks/YYYY-WXX.json`

For W25 pilot:

`data/weeks/2026-W25.json`

## Issue Fields To Change

- `issue.week`: ISO week label, for example `2026-W25`
- `issue.issueNumber`: numeric issue number
- `issue.slug`: page slug without `.html`
- `issue.outputFile`: generated public HTML file
- `issue.publishDate`: target publish date
- `issue.coverage.start`, `issue.coverage.end`, `issue.coverage.actualEnd`
- `issue.title`, `issue.theme`, `issue.dek`, `issue.lede`
- `issue.canonicalUrl`
- `workflow.status`: `test`, `draft`, `review`, `approved`, or `published`
- `workflow.sourceChecked`, `workflow.claimChecked`, `workflow.editorApproved`, `workflow.publishApproved`

## Signal Fields To Change

There must be exactly nine signal records for the Week 23-style issue.

For each signal, update:

- `number`: 1 to 9
- `id`: stable issue-specific ID
- `lane`: domain lane, for example AI Governance, Regulatory Evidence, Quality Systems
- `horizon`: short operating category
- `title`: headline
- `cardFact`: short fact for the card
- `whyItMatters`: decision relevance
- `sourceTitle`, `sourceUrl`, `sourceDate`, `sourceType`
- `expandedSummary`: longer explanation
- `tiles`: three operating tiles
- `visual.title`, `visual.nodes`, `visual.footer`
- `claimBoundary`: what this signal does and does not claim

## Generate The Public Page

From the signal project folder:

```bash
python3 scripts/render_week.py data/weeks/2026-W25.json
```

The renderer writes:

`public/2026-06-22_weekly-w25.html`

## Preview Locally

From `public`:

```bash
python3 -m http.server 8093
```

Open:

`http://localhost:8093/2026-06-22_weekly-w25.html`

## Admin Editor

Use the browser-only editor at:

`admin/index.html`

It can load the W25 JSON, let you edit the issue and nine signals, and export an updated JSON file. In this first phase it does not write directly to GitHub or Netlify. That is intentional: this makes the workflow portable and safe while the content model is still settling.

## Real-Time Future Path

Phase 1 keeps content in Git-backed JSON files and deploys static pages to Netlify.

Phase 2 can add an online save button using one of these routes:

- GitHub write workflow: admin saves JSON to the repository, Netlify deploys automatically.
- Netlify Function: admin submits JSON to a protected function, which writes to GitHub or a database.
- Netlify Database: store review queue, source intake, editor notes, statuses, and activity logs while still rendering public issues from controlled JSON.

The safest next step is GitHub-backed JSON first. It gives you an online CMS without making the live public site dependent on a database.
