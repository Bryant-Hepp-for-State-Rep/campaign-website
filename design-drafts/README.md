# Design Drafts — Color Theme Exploration

Seven theme variants of the same page, built to evaluate which color
direction best serves the campaign's positioning. Companion to
`docs/design-research.md` §4 (color subsection on Detroit civic vs.
fresh palette).

## How to view

Open `index.html` in a browser to see all seven drafts side-by-side
(rendered as iframes). Click any thumbnail to open that theme full
size in `drafts/N-theme.html`.

No build step. Pure static HTML + CSS. No JavaScript. No Google
Fonts. System font stack only.

## Architecture

- `styles/base.css` — reset, typography, layout primitives. Theme-
  agnostic.
- `styles/components.css` — every component (hero, cards, buttons,
  etc.) styled in terms of CSS custom properties (variables). Theme-
  agnostic — the variables come from the theme file.
- `themes/N-name.css` — sets only the CSS custom properties (palette,
  loud-block treatment). One file per theme. ~30 lines each.
- `drafts/N-name.html` — identical structural HTML across all seven
  drafts. The only difference is which theme file is linked.

To add a new theme: copy a `themes/*.css`, override the variables,
and link from a new `drafts/*.html`.

## The seven themes

### Base palettes (4)

1. **Detroit Flag** — red, navy, gold on warm white.
   - Civic-patriotic-local. Most directly evokes "Detroit." Risk:
     reads as patriotic-default if not handled deliberately.
2. **DDOT × Dem Navy** — DDOT bus livery green plus traditional
   Democratic navy.
   - Transit-forward, signals infrastructure. Bridges Bryant's
     transit issue with the visual familiarity of Democratic
     campaigning.
3. **Palestine Subtle** — deep olive green, warm rust red, cream,
   soft charcoal.
   - Values-aligned for those who recognize the palette; reads
     as warm earth-tone for those who don't. Deliberately not the
     literal Palestine flag.
4. **Pure Michigan** — lake blue, forest green, warm cream.
   - State-level civic, evokes the "Pure Michigan" tourism
     visual vocabulary. Distances slightly from Detroit-specific
     framing toward statewide identity.

### Permutations (3 — multilayered meaning)

5. **Detroit Flag × Palestine Subtle** — Detroit flag red as
   accent on a Palestine-green primary, warm cream background,
   gold tertiary.
   - Reads as Detroit civic on the surface; second layer evokes
     Palestine for those who recognize. The most explicitly
     layered of the seven.
6. **DDOT × Palestine** — DDOT green doubles as Palestine green
   (they're nearly the same hue), warm rust accent, cream.
   - Cleanest single-color overlap of any permutation. Transit
     infrastructure and Palestine values use the same green
     without contradiction.
7. **Michigan × Detroit** — Michigan forest green as primary,
   Detroit flag navy as accent, gold tertiary, warm cream.
   - State + city. Reads as broad civic identity; bridges the
     "I'm running for state office representing a Detroit
     district" framing.

## Evaluation criteria

When comparing drafts, ask:

1. **Five-second test (per design-research.md §2):** does the
   tagline still read clearly, or does the palette compete with
   the message?
2. **Distinctiveness:** does this look different from the default
   "navy-blue Democrat" palette enough to be ownable?
3. **Local resonance:** does this look like a Detroit / HD-9
   campaign, or could it be any state-house race anywhere?
4. **Layered meaning:** which themes carry meaning beyond
   aesthetic? (Palestine subtle, DDOT × Palestine, Detroit ×
   Palestine.)
5. **Adversarial reading:** how does each palette read in a
   hostile screenshot? (Especially relevant for the Palestine-
   evoking variants — see `design-research.md` §1, audience #5.)

## Notes on content

The page content is a near-final draft of the homepage based on the
`design-research.md` recommendations and the existing-site analysis.
Verify before launch:

- The **5x auto insurance disparity figure** is currently a
  placeholder pending direct extraction from the September 2025
  advocacy report (per `design-research.md` §5, "Note on numbers").
- All photo placeholders need real photography (per
  `existing-site-analysis.md` §3 — community / candid, not stock).
- The donate CTA is marked "coming soon" pending ActBlue committee
  setup (per `design-research.md` §10, open question #2).
- Email signup form has no backend yet; placeholder action.

## Not yet themed

The following have *no* theme variation yet because they are
content / structural decisions, not palette decisions:

- Typography (system stack throughout for now; pick a self-hosted
  display face after color is settled).
- Photography (placeholders; real photos drive their own color
  decisions through dominant tones).
- Logo / wordmark (none yet — the header uses a typographic
  treatment of "Hepp for Rep" instead).
