/* ============================================================
   Logo system — shared across the gallery, the lockup
   exploration page, and the seven theme drafts.

   What this file does:
   - Defines the palette / theme presets, layouts, chromatic
     stack, font overrides, custom-color logic.
   - Injects a <style> block at runtime so each page picks up
     the rules without a separate CSS file.
   - Optionally injects the control bar at the element with
     id="logo-system-bar". Pages without that element still
     get the rules; only the bar is opt-in.
   - Wires up controllers and persists each axis to its own
     localStorage key, so any change on one page propagates
     to every other open document on the same origin.

   Same localStorage keys as logo-explorations.html so the
   two stay in sync.
   ============================================================ */
(function () {
  'use strict';

  // ---- CSS injected into <head> ---------------------------
  // The body[data-theme="..."] rules are built from THEMES at
  // runtime (see __THEMES_CSS__ below). Each theme rule sets
  // BOTH the four lockup colors (--c-gold / --c-warm /
  // --c-anchor / --c-cream) AND the page-chrome variables
  // (--color-bg, --color-surface, --color-text, --color-loud-bg,
  // wordmark colors, footer colors, etc.) so picking a theme on
  // any page rerenders the full chrome, not just the logo.
  var CSS = `
    /* Default theme variables (detroit-flag-rust). Pages may
       override --c-* via inline body style for custom colors. */
    :root {
      --c-gold:   #B58E1F;
      --c-warm:   #B14328;
      --c-anchor: #1B2A4E;
      --c-cream:  #FAF7F0;
    }

    __THEMES_CSS__

    /* Chromatic stack — two letterform layers (front + offset
       shadow) on a third-color bg. Single text-shadow only;
       offset is parametric via --offset-multiplier (slider). */
    .cstack__hepp,
    .cstack__rep {
      color: var(--cstack-front);
      text-shadow: var(--cstack-offset) var(--cstack-offset) 0 var(--cstack-shadow);
    }
    .cstack__for {
      color: var(--cstack-for, var(--c-warm));
      text-shadow: none !important;
      font-family: var(--for-font, "Inter"), sans-serif !important;
      font-weight: var(--for-weight, 700) !important;
      font-style: var(--for-style, italic) !important;
    }
    .cstack    { --cstack-offset: calc(var(--offset-multiplier, 1) * 4px); }
    .cstack--lg{
      --cstack-offset: calc(var(--offset-multiplier, 1) * 7px);
      font-size: clamp(3.5rem, 10vw, 6.5rem);
      line-height: 0.85;
    }
    /* Header-scale lockup. Smaller offset, smaller font-size,
       intended for top-nav use (replaces the old small wordmark
       in the drafts' site-header / footer). */
    .cstack--sm {
      --cstack-offset: calc(var(--offset-multiplier, 1) * 1.5px);
      font-size: 1.5rem;
      line-height: 0.82;
    }
    /* When .cstack is wrapped in an anchor (clickable home link),
       suppress the default link underline and color so children's
       theme-driven colors win. */
    a.cstack { text-decoration: none; color: inherit; }

    /* Hero lockup wrapper (kept in stylesheet but no longer used
       on the drafts now that the logo lives in the site-header). */
    .hero__lockup { margin-block: 0.25rem 1.25rem; }

    /* When the logo-system bar is on a page that also has
       a sticky site-header (the drafts), the site-header
       yields its sticky behavior so the two don't compete
       for top:0. The bar wins because controls need to stay
       reachable during scroll. */
    .ls-bar ~ .site-header { position: static; }

    /* The drafts' theme-banner (Theme N/7 navigation) sits
       between the bar and the site-header. Pull it tighter
       so the page chrome stays compact. */
    .ls-bar ~ .theme-banner { margin-top: 0; }
    .cstack {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 0.82;
      letter-spacing: -0.04em;
      font-family: var(--cstack-font, "Archivo Black"), sans-serif;
      font-weight: var(--cstack-weight, 400);
      letter-spacing: var(--cstack-tracking, -0.025em);
    }
    .cstack__hepp, .cstack__rep { display: block; }
    .cstack__for {
      display: block;
      font-size: 0.4em;
      letter-spacing: 0;
      line-height: 1;
      margin-block: 0.18em 0.12em;
      padding-inline-start: 0.1em;
    }

    /* Six chromatic two-color permutations. Code = front-shadow.
       The third color is whichever bg the lockup sits on. */
    .order2-GR { --cstack-front: var(--c-gold);   --cstack-shadow: var(--c-warm);   }
    .order2-GN { --cstack-front: var(--c-gold);   --cstack-shadow: var(--c-anchor); }
    .order2-RG { --cstack-front: var(--c-warm);   --cstack-shadow: var(--c-gold);   }
    .order2-RN { --cstack-front: var(--c-warm);   --cstack-shadow: var(--c-anchor); }
    .order2-NG { --cstack-front: var(--c-anchor); --cstack-shadow: var(--c-gold);   }
    .order2-NR { --cstack-front: var(--c-anchor); --cstack-shadow: var(--c-warm);   }

    /* Connector defaults — fall back via the shared --for-* vars
       defined above (so font picker on "for" axis works). */
    [data-for-alt] { display: none; }

    body[data-for-font="inter"]         { --for-font: "Inter";              --for-weight: 700; }
    body[data-for-font="archivo"]       { --for-font: "Archivo Black";      --for-weight: 400; }
    body[data-for-font="anton"]         { --for-font: "Anton";              --for-weight: 400; }
    body[data-for-font="bricolage"]     { --for-font: "Bricolage Grotesque";--for-weight: 800; }
    body[data-for-font="big-shoulders"] { --for-font: "Big Shoulders Display"; --for-weight: 900; }
    body[data-for-font="bowlby"]        { --for-font: "Bowlby One";         --for-weight: 400; }
    body[data-for-font="roboto-slab"]   { --for-font: "Roboto Slab";        --for-weight: 900; }
    body[data-for-font="fraunces"]      { --for-font: "Fraunces";           --for-weight: 900; }
    body[data-for-font="funnel"]        { --for-font: "Funnel Display";     --for-weight: 900; }
    body[data-for-font="bungee"]        { --for-font: "Bungee";             --for-weight: 400; }
    body[data-for-italic="off"]         { --for-style: normal; }

    /* Body-level main-font overrides (controls .cstack only). */
    body[data-font="inter"]         { --cstack-font: "Inter";              --cstack-weight: 900; --cstack-tracking: -0.04em; }
    body[data-font="archivo"]       { --cstack-font: "Archivo Black";      --cstack-weight: 400; --cstack-tracking: -0.025em; }
    body[data-font="anton"]         { --cstack-font: "Anton";              --cstack-weight: 400; --cstack-tracking: -0.02em; }
    body[data-font="bricolage"]     { --cstack-font: "Bricolage Grotesque";--cstack-weight: 800; --cstack-tracking: -0.03em; }
    body[data-font="big-shoulders"] { --cstack-font: "Big Shoulders Display"; --cstack-weight: 900; --cstack-tracking: -0.015em; }
    body[data-font="bowlby"]        { --cstack-font: "Bowlby One";         --cstack-weight: 400; --cstack-tracking: -0.015em; }
    body[data-font="roboto-slab"]   { --cstack-font: "Roboto Slab";        --cstack-weight: 900; --cstack-tracking: -0.03em; }
    body[data-font="fraunces"]      { --cstack-font: "Fraunces";           --cstack-weight: 900; --cstack-tracking: -0.03em; }
    body[data-font="funnel"]        { --cstack-font: "Funnel Display";     --cstack-weight: 900; --cstack-tracking: -0.035em; }
    body[data-font="bungee"]        { --cstack-font: "Bungee";             --cstack-weight: 400; --cstack-tracking: 0.005em; }

    /* Layouts — block-for and block-4 reorganize the 3 elements
       into a 2-row grid where REP's last P aligns with HEPP's. */
    body[data-layout="block-for"] .cstack {
      display: inline-grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
      align-items: baseline;
      column-gap: 0;
      row-gap: 0.04em;
    }
    body[data-layout="block-for"] .cstack__hepp { grid-column: 1 / 3; grid-row: 1; }
    body[data-layout="block-for"] .cstack__for {
      grid-column: 1; grid-row: 2;
      font-size: 0.5em;
      letter-spacing: -0.005em;
      line-height: 0.95;
      margin: 0; padding: 0;
      align-self: flex-end;
    }
    body[data-layout="block-for"] .cstack__rep {
      grid-column: 2; grid-row: 2;
      justify-self: end;
    }

    body[data-layout="block-4"] .cstack {
      display: inline-grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
      align-items: baseline;
      column-gap: 0;
      row-gap: 0;
    }
    body[data-layout="block-4"] .cstack__hepp { grid-column: 1 / 3; grid-row: 1; }
    body[data-layout="block-4"] [data-for-text] { display: none; }
    body[data-layout="block-4"] [data-for-alt]  { display: inline-block; }
    body[data-layout="block-4"] .cstack__for {
      grid-column: 1; grid-row: 2;
      font-size: 1em;
      font-style: normal !important;
      font-weight: inherit !important;
      letter-spacing: -0.05em;
      line-height: 0.85;
      margin: 0; padding: 0;
      align-self: stretch;
      color: var(--cstack-front, var(--c-gold));
      text-shadow: var(--cstack-offset) var(--cstack-offset) 0 var(--cstack-shadow) !important;
    }
    body[data-layout="block-4"] .cstack__rep {
      grid-column: 2; grid-row: 2;
      justify-self: end;
    }

    /* ============================================================
       Control bar UI
       Wrapped in a "shell" with a small always-visible trigger so
       the whole bar can collapse on mobile (or by user choice).
       ============================================================ */
    .ls-bar-shell {
      position: sticky;
      top: 0;
      z-index: 50;
      margin: 0 0 1.5rem;
    }
    .ls-bar-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.4rem 0.85rem;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: saturate(180%) blur(10px);
      -webkit-backdrop-filter: saturate(180%) blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 999px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 0.78rem;
      font-weight: 600;
      color: #222;
      cursor: pointer;
      line-height: 1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .ls-bar-trigger:hover { border-color: #222; }
    .ls-bar-trigger__chevron {
      font-size: 0.6rem;
      opacity: 0.6;
      transition: transform 0.15s ease;
    }
    .ls-bar-shell[data-expanded="true"] .ls-bar-trigger__chevron {
      transform: rotate(180deg);
    }
    .ls-bar-shell[data-expanded="false"] .ls-bar { display: none; }
    .ls-bar-shell[data-expanded="true"] .ls-bar { margin-top: 0.5rem; }

    .ls-bar {
      padding: 0.55rem 0.875rem;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: saturate(180%) blur(10px);
      -webkit-backdrop-filter: saturate(180%) blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1.25rem;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #222;
    }
    /* Explicit section label for the logo-formatting controls
       (font / for / custom / offset / layout). Visually breaks
       the bar into "Theme" + "Logo formatting" sections. */
    .ls-bar__section-label {
      display: inline-flex;
      align-items: center;
      font-size: 0.62rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-weight: 700;
      color: rgba(0, 0, 0, 0.5);
      white-space: nowrap;
      padding-left: 0.6rem;
      border-left: 2px dashed rgba(0, 0, 0, 0.18);
    }
    @media (max-width: 600px) {
      .ls-bar__section-label {
        flex: 0 0 100%;
        border-left: none;
        border-top: 2px dashed rgba(0, 0, 0, 0.18);
        padding-left: 0;
        padding-top: 0.5rem;
        margin: 0.25rem 0 0;
      }
    }
    .ls-bar__group { display: flex; align-items: center; gap: 0.5rem; flex-wrap: nowrap; }
    .ls-bar__group--themes { flex-wrap: wrap; flex: 1 1 auto; }
    .ls-bar__title {
      font-size: 0.66rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      font-weight: 700;
      color: #777;
      white-space: nowrap;
    }
    .ls-bar__divider { width: 1px; height: 18px; background: rgba(0,0,0,0.1); flex: 0 0 auto; }
    .ls-bar__link {
      margin-left: auto;
      font-size: 0.74rem;
      font-weight: 600;
      color: #222;
      text-decoration: none;
      padding: 0.32rem 0.7rem;
      border: 1.5px solid rgba(0,0,0,0.18);
      border-radius: 999px;
      white-space: nowrap;
      font-family: inherit;
    }
    .ls-bar__link:hover { border-color: #222; }

    .ls-theme-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.55rem;
      background: transparent;
      border: 1.5px solid rgba(0,0,0,0.18);
      border-radius: 999px;
      font-size: 0.74rem;
      font-weight: 600;
      color: #222;
      cursor: pointer;
      font-family: inherit;
      line-height: 1;
      white-space: nowrap;
    }
    .ls-theme-btn:hover { border-color: #222; }
    .ls-theme-btn[aria-pressed="true"] {
      border-color: #222;
      border-width: 2px;
      padding: calc(0.3rem - 0.5px) calc(0.55rem - 0.5px);
      background: rgba(0,0,0,0.04);
    }
    .ls-theme-swatches { display: inline-flex; gap: 1.5px; }
    .ls-theme-dot {
      width: 9px; height: 9px;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.12) inset;
    }

    /* Theme dropdown — collapses the row of theme pills into
       a single click-to-open trigger. Saves significant
       horizontal space, especially on mobile. */
    .ls-theme-dropdown {
      position: relative;
      display: inline-block;
    }
    .ls-theme-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3rem 0.7rem 0.3rem 0.5rem;
      background: transparent;
      border: 1.5px solid rgba(0,0,0,0.18);
      border-radius: 999px;
      font-size: 0.74rem;
      font-weight: 600;
      color: #222;
      cursor: pointer;
      font-family: inherit;
      line-height: 1;
      white-space: nowrap;
    }
    .ls-theme-trigger:hover { border-color: #222; }
    .ls-theme-trigger[aria-expanded="true"] {
      border-color: #222;
      border-width: 2px;
      padding: calc(0.3rem - 0.5px) calc(0.7rem - 0.5px) calc(0.3rem - 0.5px) calc(0.5rem - 0.5px);
      background: rgba(0,0,0,0.04);
    }
    .ls-theme-trigger__chevron {
      font-size: 0.65rem;
      opacity: 0.6;
      transition: transform 0.15s ease;
      margin-left: 0.05rem;
    }
    .ls-theme-trigger[aria-expanded="true"] .ls-theme-trigger__chevron {
      transform: rotate(180deg);
    }
    .ls-theme-panel {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      z-index: 100;
      min-width: 240px;
      max-height: 60vh;
      overflow-y: auto;
      background: #fff;
      border: 1px solid rgba(0,0,0,0.12);
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.14);
      padding: 0.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .ls-theme-panel[hidden] { display: none; }
    .ls-theme-panel .ls-theme-btn {
      width: 100%;
      justify-content: flex-start;
      border-color: transparent;
    }
    .ls-theme-panel .ls-theme-btn:hover { background: rgba(0,0,0,0.05); }
    .ls-theme-panel .ls-theme-btn[aria-pressed="true"] {
      border-color: #222;
      background: rgba(0,0,0,0.04);
    }
    @media (max-width: 600px) {
      .ls-theme-panel {
        left: 0;
        right: auto;
        min-width: 280px;
      }
    }

    .ls-select {
      font-family: inherit;
      font-size: 0.74rem;
      font-weight: 600;
      padding: 0.32rem 1.6rem 0.32rem 0.6rem;
      border: 1.5px solid rgba(0,0,0,0.18);
      border-radius: 999px;
      background-color: transparent;
      background-image: linear-gradient(45deg, transparent 50%, #222 50%),
                        linear-gradient(-45deg, transparent 50%, #222 50%);
      background-position: calc(100% - 12px) calc(50% - 1px), calc(100% - 8px) calc(50% - 1px);
      background-size: 4px 4px;
      background-repeat: no-repeat;
      color: #222;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      line-height: 1;
    }
    .ls-select:hover { border-color: #222; }

    .ls-toggle-btn {
      display: inline-flex;
      align-items: center;
      padding: 0.32rem 0.6rem;
      background: transparent;
      border: 1.5px solid rgba(0,0,0,0.18);
      border-radius: 999px;
      font-size: 0.74rem;
      font-weight: 700;
      font-style: italic;
      color: #222;
      cursor: pointer;
      font-family: inherit;
      line-height: 1;
    }
    .ls-toggle-btn:hover { border-color: #222; }
    .ls-toggle-btn[aria-pressed="false"] { font-style: normal; opacity: 0.55; }
    .ls-toggle-btn[aria-pressed="true"] {
      border-color: #222;
      border-width: 2px;
      padding: calc(0.32rem - 0.5px) calc(0.6rem - 0.5px);
    }

    .ls-color-swatch {
      width: 22px;
      height: 22px;
      padding: 0;
      border: 1.5px solid rgba(0,0,0,0.18);
      border-radius: 50%;
      background: transparent;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      overflow: hidden;
      flex: 0 0 auto;
    }
    .ls-color-swatch::-webkit-color-swatch-wrapper { padding: 0; }
    .ls-color-swatch::-webkit-color-swatch { border: none; border-radius: 50%; }
    .ls-color-swatch::-moz-color-swatch { border: none; border-radius: 50%; }
    .ls-color-swatch:hover { border-color: #222; }

    .ls-reset-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px; height: 24px;
      padding: 0;
      background: transparent;
      border: 1.5px solid rgba(0,0,0,0.18);
      border-radius: 50%;
      font-size: 0.85rem;
      font-weight: 700;
      color: #222;
      cursor: pointer;
      font-family: inherit;
      line-height: 1;
    }
    .ls-reset-btn:hover { border-color: #222; }

    .ls-slider {
      width: 130px;
      accent-color: var(--c-warm);
      cursor: pointer;
    }
    .ls-slider-value {
      font-size: 0.74rem;
      font-weight: 700;
      color: #222;
      font-family: ui-monospace, "SF Mono", Menlo, monospace;
      min-width: 4.25em;
      text-align: right;
    }
  `;

  // ---- Theme presets (also used to build the bar HTML and
  // the body[data-theme="..."] CSS rules below). Each theme
  // declares the three letterform colors plus the cream/bg.
  var THEMES = [
    { key: 'detroit-flag-rust', label: 'Detroit (rust)',     colors: ['#B58E1F', '#B14328', '#1B2A4E'], cream: '#FAF7F0' },
    { key: 'detroit-flag-orig', label: 'Detroit (orig)',     colors: ['#C9A227', '#C8102E', '#1B2A4E'], cream: '#FAF7F0' },
    { key: 'detroit-palestine', label: 'Detroit × Palestine',colors: ['#C9A227', '#B14328', '#3F5C3F'], cream: '#F5F0E8' },
    { key: 'michigan-detroit',  label: 'Michigan × Detroit', colors: ['#C9A227', '#3A6B47', '#1B2A4E'], cream: '#FBF8F3' },
    { key: 'palestine-subtle',  label: 'Palestine Subtle',   colors: ['#B58E1F', '#9B3923', '#3F5C3F'], cream: '#F5F0E8' },
    { key: 'pure-michigan',     label: 'Pure Michigan',      colors: ['#E0B860', '#1B5485', '#3A6B47'], cream: '#FBF8F3' },
    { key: 'ddot-dem',          label: 'DDOT × Dem',         colors: ['#2E7D4F', '#B14328', '#0E2755'], cream: '#F2F8F3' },
    { key: 'ddot-palestine',    label: 'DDOT × Palestine',   colors: ['#2E7D4F', '#9B3923', '#2A2A2A'], cream: '#F5F0E8' },
    { key: 'mural',             label: 'Mural',              colors: ['#C77B4A', '#4F2D5C', '#6FA3B8'], cream: '#FAF6EC' },
    { key: 'diego-rivera',      label: 'Diego Rivera',       colors: ['#D4A848', '#B53D29', '#2A4858'], cream: '#F4ECDC' },
    { key: 'eastern-market',    label: 'Eastern Market',     colors: ['#D4A227', '#C04339', '#2D5B3A'], cream: '#F5EFE0' },
    { key: 'sunrise',           label: 'Sunrise',            colors: ['#E8A04A', '#5D2956', '#1F3D5C'], cream: '#FAF1E0' },
    { key: 'industrial',        label: 'Industrial',         colors: ['#C2A472', '#B14328', '#3D5A6B'], cream: '#EFEAE0' }
  ];

  // Build body[data-theme="..."] CSS rules. Each rule sets the
  // four letterform/cream colors, plus the full --color-*
  // variable set the original components.css consumes for
  // page chrome. Derivations: bg=cream, text=anchor,
  // primary=warm, accent=gold, footer=anchor, etc. The
  // wordmark-3-footer override is set to cream so the navy
  // "Rep" word stays readable against the navy footer.
  function themeCSS(t) {
    var c = t.colors;
    return 'body[data-theme="' + t.key + '"]{' +
      '--c-gold:' + c[0] + ';--c-warm:' + c[1] + ';--c-anchor:' + c[2] + ';--c-cream:' + t.cream + ';' +
      '--color-bg:' + t.cream + ';' +
      '--color-surface:#FFFFFF;' +
      '--color-text:' + c[2] + ';' +
      '--color-text-muted:rgba(0,0,0,0.55);' +
      '--color-border:rgba(0,0,0,0.10);' +
      '--color-border-strong:' + c[2] + ';' +
      '--color-primary:' + c[1] + ';' +
      '--color-primary-text:' + t.cream + ';' +
      '--color-primary-hover:' + c[1] + ';' +
      '--color-accent:' + c[0] + ';' +
      '--color-eyebrow:' + c[1] + ';' +
      '--color-loud-bg:' + c[2] + ';' +
      '--color-loud-text:' + t.cream + ';' +
      '--color-loud-accent:' + c[0] + ';' +
      '--color-highlight-bg:rgba(0,0,0,0.05);' +
      '--color-highlight-text:' + c[2] + ';' +
      '--color-wordmark-1:' + c[0] + ';' +
      '--color-wordmark-2:' + c[1] + ';' +
      '--color-wordmark-3:' + c[2] + ';' +
      '--color-wordmark-3-footer:' + t.cream + ';' +
      '--color-footer-bg:' + c[2] + ';' +
      '--color-footer-text:' + t.cream + ';' +
    '}';
  }
  var THEMES_CSS = THEMES.map(themeCSS).join('\n');
  CSS = CSS.replace('__THEMES_CSS__', THEMES_CSS);

  var FONTS = [
    { value: '',              label: 'Per-variant default', group: '' },
    { value: 'inter',         label: 'Inter Black',         group: 'Already on the page' },
    { value: 'archivo',       label: 'Archivo Black',       group: 'Already on the page' },
    { value: 'anton',         label: 'Anton (condensed)',   group: 'Already on the page' },
    { value: 'bungee',        label: 'Bungee',              group: 'Already on the page' },
    { value: 'bricolage',     label: 'Bricolage Grotesque', group: 'Sans · contemporary' },
    { value: 'funnel',        label: 'Funnel Display',      group: 'Sans · contemporary' },
    { value: 'bowlby',        label: 'Bowlby One',          group: 'Sans · poster / chunky' },
    { value: 'big-shoulders', label: 'Big Shoulders Display', group: 'Sans · poster / chunky' },
    { value: 'roboto-slab',   label: 'Roboto Slab',         group: 'Serif · editorial / civic' },
    { value: 'fraunces',      label: 'Fraunces',            group: 'Serif · editorial / civic' }
  ];

  var FOR_FONTS = [
    { value: '',              label: 'Inter (default)',     group: '' },
    { value: 'archivo',       label: 'Archivo Black',       group: 'Match a display font' },
    { value: 'anton',         label: 'Anton',               group: 'Match a display font' },
    { value: 'bricolage',     label: 'Bricolage Grotesque', group: 'Match a display font' },
    { value: 'funnel',        label: 'Funnel Display',      group: 'Match a display font' },
    { value: 'bowlby',        label: 'Bowlby One',          group: 'Match a display font' },
    { value: 'big-shoulders', label: 'Big Shoulders Display', group: 'Match a display font' },
    { value: 'roboto-slab',   label: 'Roboto Slab',         group: 'Match a display font' },
    { value: 'fraunces',      label: 'Fraunces',            group: 'Match a display font' },
    { value: 'bungee',        label: 'Bungee',              group: 'Match a display font' }
  ];

  // ---- Build bar HTML --------------------------------------
  function themeButtonsHTML() {
    return THEMES.map(function (t) {
      var dots = t.colors.map(function (c) {
        return '<span class="ls-theme-dot" style="background:' + c + '"></span>';
      }).join('');
      return '<button class="ls-theme-btn" data-theme="' + t.key + '" type="button">' +
             '<span class="ls-theme-swatches">' + dots + '</span>' + t.label +
             '</button>';
    }).join('');
  }

  function selectOptionsHTML(items) {
    var grouped = {};
    var orderedGroups = [];
    items.forEach(function (i) {
      if (i.group === '') {
        // Plain option, no group
        if (!grouped['__top']) { grouped['__top'] = []; orderedGroups.push('__top'); }
        grouped['__top'].push(i);
      } else {
        if (!grouped[i.group]) { grouped[i.group] = []; orderedGroups.push(i.group); }
        grouped[i.group].push(i);
      }
    });
    return orderedGroups.map(function (g) {
      var opts = grouped[g].map(function (i) {
        return '<option value="' + i.value + '">' + i.label + '</option>';
      }).join('');
      if (g === '__top') return opts;
      return '<optgroup label="' + g + '">' + opts + '</optgroup>';
    }).join('');
  }

  var BAR_HTML = (
    '<div class="ls-bar-shell" data-expanded="true">' +
      '<button class="ls-bar-trigger" type="button" data-bar-trigger aria-controls="ls-bar-controls" aria-expanded="true">' +
        '<span data-bar-trigger-label>Hide controls</span>' +
        '<span class="ls-bar-trigger__chevron" aria-hidden="true">▾</span>' +
      '</button>' +
    '<header class="ls-bar" id="ls-bar-controls" aria-label="Logo controls">' +
      '<div class="ls-bar__group">' +
        '<span class="ls-bar__title">Theme</span>' +
        '<div class="ls-theme-dropdown">' +
          '<button class="ls-theme-trigger" type="button" aria-expanded="false" aria-haspopup="listbox" data-theme-trigger>' +
            '<span class="ls-theme-swatches" data-theme-trigger-swatches></span>' +
            '<span data-theme-trigger-label></span>' +
            '<span class="ls-theme-trigger__chevron" aria-hidden="true">▾</span>' +
          '</button>' +
          '<div class="ls-theme-panel" role="listbox" hidden>' +
            themeButtonsHTML() +
          '</div>' +
        '</div>' +
      '</div>' +
      '<span class="ls-bar__section-label">Logo formatting</span>' +
      '<div class="ls-bar__group">' +
        '<span class="ls-bar__title">Layout</span>' +
        '<select class="ls-select" data-control="layout" aria-label="Lockup layout">' +
          '<option value="">Stacked</option>' +
          '<option value="block-for">Block · for</option>' +
          '<option value="block-4">Block · 4</option>' +
        '</select>' +
      '</div>' +
      '<span class="ls-bar__divider" aria-hidden="true"></span>' +
      '<div class="ls-bar__group">' +
        '<span class="ls-bar__title">Font</span>' +
        '<select class="ls-select" data-control="font" aria-label="Display font">' +
          selectOptionsHTML(FONTS) +
        '</select>' +
      '</div>' +
      '<span class="ls-bar__divider" aria-hidden="true"></span>' +
      '<div class="ls-bar__group">' +
        '<span class="ls-bar__title">"for"</span>' +
        '<select class="ls-select" data-control="for-font" aria-label="for connector font">' +
          selectOptionsHTML(FOR_FONTS) +
        '</select>' +
        '<button class="ls-toggle-btn" data-control="italic" type="button" aria-pressed="true">italic</button>' +
      '</div>' +
      '<span class="ls-bar__divider" aria-hidden="true"></span>' +
      '<div class="ls-bar__group" aria-label="Custom palette">' +
        '<span class="ls-bar__title">Custom</span>' +
        '<input class="ls-color-swatch" type="color" data-control="custom" data-prop="--c-gold" aria-label="HEPP color" title="HEPP color" />' +
        '<input class="ls-color-swatch" type="color" data-control="custom" data-prop="--c-warm" aria-label="for color" title="for color" />' +
        '<input class="ls-color-swatch" type="color" data-control="custom" data-prop="--c-anchor" aria-label="REP color" title="REP color" />' +
        '<button class="ls-reset-btn" data-control="reset-custom" type="button" title="Reset to theme defaults" aria-label="Reset">↺</button>' +
      '</div>' +
      '<span class="ls-bar__divider" aria-hidden="true"></span>' +
      '<div class="ls-bar__group">' +
        '<span class="ls-bar__title">Offset</span>' +
        '<input class="ls-slider" type="range" data-control="offset" min="0" max="4" step="1" value="4" aria-label="Chromatic offset" />' +
        '<output class="ls-slider-value" data-display="offset">100%</output>' +
      '</div>' +
    '</header>' +
    '</div>'
  );

  // ---- Inject CSS ------------------------------------------
  function injectCSS() {
    var styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    styleEl.setAttribute('data-logo-system', '');
    document.head.appendChild(styleEl);
  }

  // ---- Storage keys ----------------------------------------
  var KEYS = {
    theme:     'hep4rep-logo-theme',
    layout:    'hep4rep-logo-layout',
    font:      'hep4rep-logo-font',
    forFont:   'hep4rep-logo-for-font',
    italic:    'hep4rep-logo-for-italic',
    offset:    'hep4rep-logo-offset',
    custom:    'hep4rep-logo-custom',
    collapsed: 'hep4rep-logo-collapsed'
  };
  var DEFAULT_THEME = 'detroit-flag-rust';
  var CUSTOM_PROPS = ['--c-gold', '--c-warm', '--c-anchor'];

  // ---- Apply state to body ---------------------------------
  function applyTheme(name) {
    document.body.setAttribute('data-theme', name || DEFAULT_THEME);
  }
  function applyLayout(value) {
    if (value) document.body.setAttribute('data-layout', value);
    else document.body.removeAttribute('data-layout');
  }
  function applyFont(value) {
    if (value) document.body.setAttribute('data-font', value);
    else document.body.removeAttribute('data-font');
  }
  function applyForFont(value) {
    if (value) document.body.setAttribute('data-for-font', value);
    else document.body.removeAttribute('data-for-font');
  }
  function applyItalic(on) {
    if (on) document.body.removeAttribute('data-for-italic');
    else document.body.setAttribute('data-for-italic', 'off');
  }
  function applyOffset(step) {
    var n = Math.max(0, Math.min(4, parseInt(step, 10) || 0));
    document.documentElement.style.setProperty('--offset-multiplier', String(n / 4));
  }
  function applyCustom(obj) {
    CUSTOM_PROPS.forEach(function (p) { document.body.style.removeProperty(p); });
    if (obj) {
      Object.keys(obj).forEach(function (p) {
        if (CUSTOM_PROPS.indexOf(p) !== -1) {
          document.body.style.setProperty(p, obj[p]);
        }
      });
    }
  }

  // ---- Read from localStorage and apply --------------------
  function readState() {
    var s = {};
    try { s.theme = localStorage.getItem(KEYS.theme) || DEFAULT_THEME; } catch (e) { s.theme = DEFAULT_THEME; }
    try { s.layout = localStorage.getItem(KEYS.layout) || ''; } catch (e) { s.layout = ''; }
    try { s.font = localStorage.getItem(KEYS.font) || ''; } catch (e) { s.font = ''; }
    try { s.forFont = localStorage.getItem(KEYS.forFont) || ''; } catch (e) { s.forFont = ''; }
    try { s.italic = localStorage.getItem(KEYS.italic) !== '0'; } catch (e) { s.italic = true; }
    try { s.offset = parseInt(localStorage.getItem(KEYS.offset) || '4', 10); } catch (e) { s.offset = 4; }
    try { s.custom = JSON.parse(localStorage.getItem(KEYS.custom) || 'null'); } catch (e) { s.custom = null; }
    return s;
  }

  function applyAll(s) {
    applyTheme(s.theme);
    applyLayout(s.layout);
    applyFont(s.font);
    applyForFont(s.forFont);
    applyItalic(s.italic);
    applyOffset(s.offset);
    applyCustom(s.custom);
  }

  // ---- Wire up bar (only if a mount point exists) ----------
  function rgbToHex(rgb) {
    var m = rgb && rgb.match && rgb.match(/^rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    if (!m) return null;
    return ('#' + [m[1], m[2], m[3]].map(function (n) {
      var h = parseInt(n, 10).toString(16);
      return h.length === 1 ? '0' + h : h;
    }).join('')).toUpperCase();
  }
  function normalizeHex(c) {
    if (!c) return null;
    c = c.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(c)) return c.toUpperCase();
    if (/^#[0-9A-Fa-f]{3}$/.test(c)) {
      return ('#' + c.slice(1).split('').map(function (ch) { return ch + ch; }).join('')).toUpperCase();
    }
    if (c.indexOf('rgb') === 0) return rgbToHex(c);
    return null;
  }

  function syncCustomSwatches(bar) {
    var cs = getComputedStyle(document.body);
    bar.querySelectorAll('input[data-control="custom"]').forEach(function (inp) {
      var hex = normalizeHex(cs.getPropertyValue(inp.dataset.prop));
      if (hex) inp.value = hex;
    });
  }

  // Find a theme by key (no Array.find for older browser compat)
  function findTheme(key) {
    for (var i = 0; i < THEMES.length; i++) {
      if (THEMES[i].key === key) return THEMES[i];
    }
    return THEMES[0];
  }

  // Update the dropdown trigger's swatches + label to match
  // the active theme.
  function updateThemeTrigger(bar, themeKey) {
    var t = findTheme(themeKey);
    var sw = bar.querySelector('[data-theme-trigger-swatches]');
    var lbl = bar.querySelector('[data-theme-trigger-label]');
    if (sw) {
      sw.innerHTML = t.colors.map(function (c) {
        return '<span class="ls-theme-dot" style="background:' + c + '"></span>';
      }).join('');
    }
    if (lbl) lbl.textContent = t.label;
  }

  function closeThemePanel(bar) {
    var trigger = bar.querySelector('[data-theme-trigger]');
    var panel = bar.querySelector('.ls-theme-panel');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (panel) panel.hidden = true;
  }

  function wireBar(bar) {
    var s = readState();

    // Theme dropdown — trigger toggles the panel
    var trigger = bar.querySelector('[data-theme-trigger]');
    var panel = bar.querySelector('.ls-theme-panel');
    if (trigger && panel) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
        panel.hidden = open;
      });
      // Click outside the panel closes it
      document.addEventListener('click', function (e) {
        if (panel.hidden) return;
        if (panel.contains(e.target) || trigger.contains(e.target)) return;
        closeThemePanel(bar);
      });
      // Escape closes
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !panel.hidden) closeThemePanel(bar);
      });
    }

    // Initial trigger display
    updateThemeTrigger(bar, s.theme);

    // Theme buttons inside the panel
    bar.querySelectorAll('.ls-theme-btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.dataset.theme === s.theme ? 'true' : 'false');
      btn.addEventListener('click', function () {
        // Theme click clears custom colors
        try { localStorage.removeItem(KEYS.custom); } catch (e) {}
        applyCustom(null);
        applyTheme(btn.dataset.theme);
        try { localStorage.setItem(KEYS.theme, btn.dataset.theme); } catch (e) {}
        bar.querySelectorAll('.ls-theme-btn').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        updateThemeTrigger(bar, btn.dataset.theme);
        closeThemePanel(bar);
        requestAnimationFrame(function () { syncCustomSwatches(bar); });
      });
    });
    // Layout
    var layoutSel = bar.querySelector('select[data-control="layout"]');
    if (layoutSel) {
      layoutSel.value = s.layout;
      layoutSel.addEventListener('change', function () {
        applyLayout(layoutSel.value);
        try { localStorage.setItem(KEYS.layout, layoutSel.value); } catch (e) {}
      });
    }
    // Font
    var fontSel = bar.querySelector('select[data-control="font"]');
    if (fontSel) {
      fontSel.value = s.font;
      fontSel.addEventListener('change', function () {
        applyFont(fontSel.value);
        try { localStorage.setItem(KEYS.font, fontSel.value); } catch (e) {}
      });
    }
    // For-font
    var forFontSel = bar.querySelector('select[data-control="for-font"]');
    if (forFontSel) {
      forFontSel.value = s.forFont;
      forFontSel.addEventListener('change', function () {
        applyForFont(forFontSel.value);
        try { localStorage.setItem(KEYS.forFont, forFontSel.value); } catch (e) {}
      });
    }
    // Italic toggle
    var italicBtn = bar.querySelector('button[data-control="italic"]');
    if (italicBtn) {
      italicBtn.setAttribute('aria-pressed', s.italic ? 'true' : 'false');
      italicBtn.addEventListener('click', function () {
        var on = italicBtn.getAttribute('aria-pressed') !== 'true';
        applyItalic(on);
        italicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        try { localStorage.setItem(KEYS.italic, on ? '1' : '0'); } catch (e) {}
      });
    }
    // Custom color swatches
    bar.querySelectorAll('input[data-control="custom"]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        document.body.style.setProperty(inp.dataset.prop, inp.value);
        var obj = {};
        bar.querySelectorAll('input[data-control="custom"]').forEach(function (i) {
          var v = document.body.style.getPropertyValue(i.dataset.prop);
          if (v) obj[i.dataset.prop] = v.trim();
        });
        try {
          if (Object.keys(obj).length === 0) localStorage.removeItem(KEYS.custom);
          else localStorage.setItem(KEYS.custom, JSON.stringify(obj));
        } catch (e) {}
      });
    });
    // Reset custom
    var resetBtn = bar.querySelector('button[data-control="reset-custom"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        applyCustom(null);
        try { localStorage.removeItem(KEYS.custom); } catch (e) {}
        syncCustomSwatches(bar);
      });
    }
    // Offset slider
    var slider = bar.querySelector('input[data-control="offset"]');
    var sliderOut = bar.querySelector('output[data-display="offset"]');
    if (slider) {
      slider.value = String(s.offset);
      if (sliderOut) sliderOut.textContent = ((s.offset / 4) * 100).toFixed(0) + '%';
      slider.addEventListener('input', function () {
        var n = parseInt(slider.value, 10);
        applyOffset(n);
        if (sliderOut) sliderOut.textContent = ((n / 4) * 100).toFixed(0) + '%';
        try { localStorage.setItem(KEYS.offset, String(n)); } catch (e) {}
      });
    }

    // Initial swatch sync
    syncCustomSwatches(bar);
  }

  // ---- Cross-document sync via storage events --------------
  function handleStorage(e) {
    if (!e.key || e.key.indexOf('hep4rep-logo-') !== 0) return;
    var s = readState();
    applyAll(s);
    // If a bar is mounted, re-sync its widget values
    var bar = document.querySelector('.ls-bar');
    if (bar) {
      bar.querySelectorAll('.ls-theme-btn').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.theme === s.theme ? 'true' : 'false');
      });
      updateThemeTrigger(bar, s.theme);
      var ls = bar.querySelector('select[data-control="layout"]');     if (ls) ls.value = s.layout;
      var fs = bar.querySelector('select[data-control="font"]');       if (fs) fs.value = s.font;
      var ffs= bar.querySelector('select[data-control="for-font"]');   if (ffs) ffs.value = s.forFont;
      var ib = bar.querySelector('button[data-control="italic"]');     if (ib) ib.setAttribute('aria-pressed', s.italic ? 'true' : 'false');
      var sl = bar.querySelector('input[data-control="offset"]');      if (sl) sl.value = String(s.offset);
      var so = bar.querySelector('output[data-display="offset"]');     if (so) so.textContent = ((s.offset / 4) * 100).toFixed(0) + '%';
      requestAnimationFrame(function () { syncCustomSwatches(bar); });
    }
  }

  // ---- Bar shell (collapse/expand) -------------------------
  function setShellExpanded(shell, trigger, expanded) {
    shell.setAttribute('data-expanded', expanded ? 'true' : 'false');
    if (trigger) {
      trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      var lbl = trigger.querySelector('[data-bar-trigger-label]');
      if (lbl) lbl.textContent = expanded ? 'Hide controls' : 'Customize';
    }
  }

  function wireShell() {
    var shell = document.querySelector('.ls-bar-shell');
    var trigger = shell ? shell.querySelector('[data-bar-trigger]') : null;
    if (!shell || !trigger) return;

    // Initial state — saved choice wins, otherwise mobile defaults
    // to collapsed and desktop defaults to expanded.
    var expanded = true;
    try {
      var saved = localStorage.getItem(KEYS.collapsed);
      if (saved === '1') expanded = false;
      else if (saved === '0') expanded = true;
      else if (window.matchMedia && window.matchMedia('(max-width: 720px)').matches) {
        expanded = false;
      }
    } catch (e) {}
    setShellExpanded(shell, trigger, expanded);

    trigger.addEventListener('click', function () {
      var isOpen = shell.getAttribute('data-expanded') === 'true';
      setShellExpanded(shell, trigger, !isOpen);
      try { localStorage.setItem(KEYS.collapsed, isOpen ? '1' : '0'); } catch (e) {}
    });
  }

  // ---- Init ------------------------------------------------
  function init() {
    injectCSS();
    applyAll(readState());

    var mount = document.getElementById('logo-system-bar');
    if (mount) {
      mount.outerHTML = BAR_HTML;
      var bar = document.querySelector('.ls-bar');
      if (bar) wireBar(bar);
      wireShell();
    }

    window.addEventListener('storage', handleStorage);

    // Expose a tiny API for legacy callers (e.g. wordmark-font.js)
    window.__hepp4repLogoSystem = {
      apply: applyAll,
      read: readState,
      keys: KEYS
    };
  }

  // The script is loaded with `defer`, but be defensive.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
