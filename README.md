# hep4rep

Design drafts for **Bryant Hepp's** campaign for Michigan State House
District 9. Bryant is a limited-license social worker and urban planner
running on auto-insurance redlining, transit, and housing.

## What's in this repo

- **`design-drafts/`** — homepage layout drafts in seven color themes,
  plus an interactive logo / typography exploration tool. All static
  HTML / CSS / JS, no build step.
- **`index.html`** — top-level redirect to the drafts gallery.

## How to view

- **Live (GitHub Pages):** [hep4rep design drafts](./design-drafts/)
- **Locally:** `python3 -m http.server 8000` from the repo root, then
  open <http://localhost:8000/design-drafts/>.

The gallery (`design-drafts/index.html`) shows all seven themes
side-by-side as iframes. The logo exploration tool
(`design-drafts/logo-explorations.html`) has interactive controls for
theme, layout, font, "for"-font, italic toggle, chromatic offset, and
custom color picker.

## Status

Pre-launch drafts. Content is a working draft, not the candidate's
published platform — anything sent to Bryant for review may differ
from his actual positions until he confirms.

## Stack

Static HTML + CSS, system font stack as the page chrome, a handful of
display fonts loaded from Google Fonts CDN for the logo lockup
(production will self-host). Designed to migrate cleanly to Astro +
Tailwind on Cloudflare Pages when the campaign is ready.
