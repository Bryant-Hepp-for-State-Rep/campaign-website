// Decap CMS preview templates.
//
// Decap's default preview pane just dumps field values as plain text.
// To make Bryant see how copy actually lands in the design language,
// we register:
//
//   1. The site stylesheets (base.css + components.css + the
//      Detroit-flag theme CSS, which provides default values for the
//      --color-* custom properties the components rely on).
//   2. Google Fonts so headlines render in Inter / 800 weight rather
//      than the iframe's default sans.
//   3. A preview component per page (home, about, policy_auto_insurance)
//      that mirrors the Eleventy template structure.
//
// Cross-collection references (e.g. home page picking 3 priorities by
// slug, or in_focus.current_issue pointing at an issue) cannot be
// resolved in the preview without a live data fetch, so those render
// as placeholders. Bryant sees the structure; the live page resolves
// the relations.

// ── Workaround: preview pane stops scrolling after divider resize ─
// Decap's form/preview divider drag appears to leave a stuck
// pointer-events state on something — possibly an overlay element
// from the drag handler — that intercepts scroll-wheel events on the
// preview iframe until the user clicks somewhere. We can't reach the
// offending element directly from here, but firing a synthetic resize
// event after every drag-completion gives Decap (and any layout-aware
// React component) a chance to recompute and clear the state.
//
// Filtered to only fire after gestures that actually moved the mouse
// (i.e. drags, not regular clicks) and to ignore synthetic events to
// avoid feedback loops. Runs in the admin parent window — preview.js
// is loaded by admin/index.html alongside decap-cms.js, not inside
// the preview iframe.
//
// Tracking issue: filed upstream in decapcms/decap-cms.
(function () {
  let dragStart = null;
  document.addEventListener("mousedown", function (e) {
    if (e.button === 0 && e.isTrusted) {
      dragStart = { x: e.clientX, y: e.clientY };
    }
  });
  document.addEventListener("mouseup", function (e) {
    if (!e.isTrusted) return;
    const start = dragStart;
    dragStart = null;
    if (!start) return;
    const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
    if (moved < 5) return; // not a drag — ignore regular clicks
    // Let Decap's own mouseup handlers run first, then nudge.
    setTimeout(function () {
      window.dispatchEvent(new Event("resize"));
    }, 50);
  });
})();

(function () {
  // Load markdown-it from CDN so we can render the same restricted
  // markdown the build uses. Two renderers, mirroring the .eleventy.js
  // setup: mdInline (no block elements) and mdBody (paragraphs only,
  // no headings/images/lists/code).
  const mdScript = document.createElement("script");
  mdScript.src =
    "https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js";
  document.head.appendChild(mdScript);

  mdScript.onload = function () {
    const mdInline = window.markdownit({ html: false, linkify: true });
    const mdBody = window
      .markdownit({ html: false, linkify: true })
      .disable([
        "heading",
        "image",
        "code",
        "fence",
        "hr",
        "table",
        "html_block",
        "html_inline",
      ]);

    function renderInline(text) {
      return text ? mdInline.renderInline(String(text)) : "";
    }
    function renderBody(text) {
      return text ? mdBody.render(String(text)) : "";
    }

    const h = window.h;

    // Helper: a small "set inner HTML from rendered markdown" prop builder.
    function html(rendered) {
      return { dangerouslySetInnerHTML: { __html: rendered } };
    }

    // ── HOME PAGE PREVIEW ──────────────────────────────────────────
    function HomePreview(props) {
      const data = props.entry.getIn(["data"]).toJS();
      const hero = data.hero || {};
      const aboutTeaser = data.about_teaser || {};
      const prio = data.priorities_section || {};
      const focus = data.in_focus || {};
      const give = data.get_involved || {};
      const email = give.email_card || {};
      const vol = give.volunteer_card || {};
      const donate = give.donate_card || {};

      return h(
        "div",
        {},
        // Hero
        h(
          "section",
          { className: "hero" },
          h(
            "div",
            { className: "container" },
            h(
              "div",
              { className: "hero__grid" },
              h(
                "div",
                {},
                h("span", { className: "hero__office" }, hero.eyebrow || ""),
                h("h1", { className: "hero__name" }, hero.name || ""),
                h(
                  "p",
                  { className: "hero__district" },
                  hero.district_line || ""
                ),
                h("p", { className: "hero__tagline" }, hero.tagline || ""),
                h(
                  "p",
                  Object.assign(
                    { className: "hero__subhead" },
                    html(renderInline(hero.subhead))
                  )
                ),
                h(
                  "div",
                  { className: "hero__ctas" },
                  hero.primary_cta &&
                    h(
                      "a",
                      { className: "button button--primary", href: "#" },
                      hero.primary_cta.label || ""
                    ),
                  hero.secondary_cta &&
                    hero.secondary_cta.label &&
                    h(
                      "a",
                      { className: "button button--secondary", href: "#" },
                      hero.secondary_cta.label
                    )
                )
              ),
              h(
                "div",
                { className: "hero__photo", "aria-hidden": "true" },
                "[ Photo placeholder ]"
              )
            )
          )
        ),
        // About teaser
        h(
          "section",
          { id: "about", className: "about" },
          h(
            "div",
            { className: "container" },
            h(
              "div",
              { className: "about__grid" },
              h(
                "div",
                { className: "about__photo", "aria-hidden": "true" },
                "[ Photo ]"
              ),
              h(
                "div",
                { className: "about__body" },
                h(
                  "h2",
                  { className: "about__heading" },
                  aboutTeaser.heading || ""
                ),
                h(
                  "div",
                  Object.assign(
                    { className: "lead" },
                    html(renderBody(aboutTeaser.lede))
                  )
                ),
                h("div", html(renderBody(aboutTeaser.body))),
                aboutTeaser.link_text &&
                  h(
                    "p",
                    {},
                    h("a", { href: "#" }, aboutTeaser.link_text)
                  )
              )
            )
          )
        ),
        // Priorities section — relations resolve on the live page only
        h(
          "section",
          { id: "priorities" },
          h(
            "div",
            { className: "container" },
            h(
              "h2",
              { className: "priorities__heading" },
              prio.heading || ""
            ),
            h(
              "div",
              Object.assign(
                { className: "priorities__lede" },
                html(renderBody(prio.lede))
              )
            ),
            h(
              "div",
              { className: "priorities__grid" },
              (prio.priorities || []).map(function (slug, i) {
                return h(
                  "article",
                  { key: i, className: "priority-card" },
                  h(
                    "span",
                    { className: "priority-card__number" },
                    "0" + (i + 1) + " / " + slug
                  ),
                  h(
                    "p",
                    { style: { fontStyle: "italic", opacity: 0.6 } },
                    "(Priority \"" +
                      slug +
                      "\" — body rendered on live page from the Priorities collection.)"
                  )
                );
              })
            )
          )
        ),
        // In Focus — issue resolves on the live page only
        h(
          "section",
          { id: "in-focus", className: "in-focus" },
          h(
            "div",
            { className: "container" },
            h(
              "p",
              { className: "in-focus__eyebrow" },
              focus.eyebrow || ""
            ),
            h(
              "p",
              { style: { fontStyle: "italic", opacity: 0.6 } },
              '(In Focus issue: "' +
                (focus.current_issue || "") +
                '" — full content rendered on live page from the Issues collection.)'
            )
          )
        ),
        // Get involved
        h(
          "section",
          { id: "get-involved" },
          h(
            "div",
            { className: "container" },
            h(
              "h2",
              { className: "get-involved__heading" },
              give.heading || ""
            ),
            h(
              "div",
              { className: "get-involved__grid" },
              h(
                "div",
                { className: "cta-card cta-card--primary" },
                h(
                  "h3",
                  { className: "cta-card__heading" },
                  email.heading || ""
                ),
                h(
                  "div",
                  Object.assign(
                    { className: "cta-card__body" },
                    html(renderBody(email.body))
                  )
                )
              ),
              h(
                "div",
                { className: "cta-card" },
                h(
                  "h3",
                  { className: "cta-card__heading" },
                  vol.heading || ""
                ),
                h(
                  "div",
                  Object.assign(
                    { className: "cta-card__body" },
                    html(renderBody(vol.body))
                  )
                )
              ),
              h(
                "div",
                { className: "cta-card" },
                h(
                  "h3",
                  { className: "cta-card__heading" },
                  donate.heading || ""
                ),
                h(
                  "div",
                  Object.assign(
                    { className: "cta-card__body" },
                    html(renderBody(donate.body))
                  )
                ),
                donate.enabled
                  ? null
                  : h(
                      "span",
                      { className: "cta-card__pending" },
                      donate.pending_label || ""
                    )
              )
            )
          )
        )
      );
    }

    // ── ABOUT PAGE PREVIEW ─────────────────────────────────────────
    function AboutPreview(props) {
      const data = props.entry.getIn(["data"]).toJS();
      const hero = data.hero || {};
      const sections = data.bio_sections || [];

      // Inline styles, mirroring the about template's <style> block.
      const aboutStyle = `
        .bio-hero { padding-block: 3rem 2rem; }
        .bio-hero__grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 3rem; align-items: start; }
        .bio-hero__photo { aspect-ratio: 4 / 5; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); font-style: italic; }
        .bio-hero__eyebrow { font-size: 0.85rem; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; color: var(--color-eyebrow); margin-bottom: 0.75rem; }
        .bio-hero__name { font-size: 3rem; font-weight: 800; line-height: 1.05; margin-bottom: 0.5rem; }
        .bio-hero__role { font-size: 1.05rem; color: var(--color-text-muted); margin-bottom: 1.75rem; }
        .bio-hero__lede { font-size: 1.2rem; line-height: 1.55; max-width: 50ch; }
        .bio-section { padding-block: 2.5rem; border-top: 1px solid var(--color-border); }
        .bio-section__heading { font-size: 0.85rem; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; color: var(--color-eyebrow); margin-bottom: 1.5rem; }
        .bio-section p { font-size: 1.05rem; line-height: 1.6; margin-bottom: 1rem; max-width: 60ch; }
        .bio-list { list-style: none; padding: 0; margin: 0; max-width: 60ch; }
        .bio-list li { padding: 0.875rem 0; border-bottom: 1px solid var(--color-border); display: grid; grid-template-columns: 6em 1fr; gap: 1rem; align-items: baseline; }
        .bio-list strong { color: var(--color-text-muted); font-weight: 700; font-size: 0.9rem; }
      `;

      return h(
        "div",
        {},
        h("style", {}, aboutStyle),
        h(
          "section",
          { className: "bio-hero" },
          h(
            "div",
            { className: "container" },
            h(
              "div",
              { className: "bio-hero__grid" },
              h(
                "div",
                { className: "bio-hero__photo", "aria-hidden": "true" },
                "[ Portrait ]"
              ),
              h(
                "div",
                {},
                h(
                  "p",
                  { className: "bio-hero__eyebrow" },
                  hero.eyebrow || ""
                ),
                h("h1", { className: "bio-hero__name" }, hero.name || ""),
                h("p", { className: "bio-hero__role" }, hero.role || ""),
                h(
                  "div",
                  Object.assign(
                    { className: "bio-hero__lede" },
                    html(renderBody(hero.lede))
                  )
                )
              )
            )
          )
        ),
        sections.map(function (section, i) {
          return h(
            "section",
            { key: i, className: "bio-section" },
            h(
              "div",
              { className: "container" },
              h(
                "h2",
                { className: "bio-section__heading" },
                section.eyebrow || ""
              ),
              section.type === "prose"
                ? h("div", html(renderBody(section.body)))
                : h(
                    "ul",
                    { className: "bio-list" },
                    (section.items || []).map(function (item, j) {
                      return h(
                        "li",
                        { key: j },
                        h("strong", {}, item.label || ""),
                        h(
                          "span",
                          html(renderInline(item.text))
                        )
                      );
                    })
                  )
            )
          );
        })
      );
    }

    // ── POLICY: AUTO INSURANCE PREVIEW ─────────────────────────────
    function PolicyAutoInsurancePreview(props) {
      const data = props.entry.getIn(["data"]).toJS();
      const hero = data.hero || {};
      const evidence = data.evidence || {};
      const reform = data.reform_2019 || {};
      const pillars = data.pillars || {};
      const theory = data.theory_of_change || {};
      const cta = data.cta || {};

      // Inline styles mirroring src/policy/auto-insurance.njk
      const policyStyle = `
        .policy section { padding-block: 3rem; border-top: 1px solid var(--color-border); }
        .policy section:first-of-type { border-top: 0; }
        .policy-section__eyebrow, .policy-hero__eyebrow {
          font-size: 0.85rem; letter-spacing: 0.18em; text-transform: uppercase;
          font-weight: 700; color: var(--color-eyebrow); margin-bottom: 1rem;
        }
        .policy-hero__heading { font-size: 3rem; font-weight: 800; line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 1.25rem; max-width: 22ch; }
        .policy-hero__lede { font-size: 1.15rem; line-height: 1.55; max-width: 60ch; color: var(--color-text-muted); }
        .policy-section__heading { font-size: 2.25rem; font-weight: 800; line-height: 1.1; margin-bottom: 0.75rem; max-width: 22ch; }
        .policy-section__lede { font-size: 1.1rem; line-height: 1.55; max-width: 60ch; color: var(--color-text-muted); margin-bottom: 2rem; }
        .citations { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; max-width: 1100px; margin-bottom: 1.5rem; }
        .citation { border: 1px solid var(--color-border); border-radius: 4px; padding: 1.5rem; background: var(--color-surface, #fff); }
        .citation__figure { font-size: 2.75rem; font-weight: 800; color: var(--color-primary); line-height: 1; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
        .citation__source { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.15rem; }
        .citation__date { font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.85rem; }
        .citation__finding { font-size: 0.98rem; line-height: 1.5; }
        .evidence-row-label { font-size: 0.75rem; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 700; color: var(--color-text-muted); margin: 2.25rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--color-border); }
        .evidence-row-label:first-of-type { margin-top: 1rem; }
        .pillar { display: grid; grid-template-columns: 4rem 1fr; gap: 2rem; padding: 1.75rem 0; border-top: 1px solid var(--color-border); align-items: start; }
        .pillar:first-of-type { border-top: 0; padding-top: 0; }
        .pillar__num { font-size: 1.5rem; font-weight: 800; color: var(--color-eyebrow); }
        .pillar__heading { font-size: 1.4rem; font-weight: 800; line-height: 1.2; margin-bottom: 0.5rem; }
        .pillar__body p { margin-bottom: 0.75rem; line-height: 1.55; max-width: 56ch; }
        .policy-cta { background: var(--color-loud-bg, var(--color-surface)); color: var(--color-loud-text, var(--color-text)); }
        .policy-cta__heading { font-size: 2rem; font-weight: 800; margin-bottom: 0.75rem; }
      `;

      function renderCitations(arr) {
        return (arr || []).map(function (c, i) {
          return h(
            "article",
            { key: i, className: "citation" },
            h(
              "div",
              { className: "citation__figure" },
              c.figure || ""
            ),
            h(
              "p",
              Object.assign(
                { className: "citation__source" },
                html(renderInline(c.source))
              )
            ),
            h(
              "p",
              { className: "citation__date" },
              c.date || ""
            ),
            h(
              "p",
              Object.assign(
                { className: "citation__finding" },
                html(renderInline(c.finding))
              )
            )
          );
        });
      }

      return h(
        "div",
        { className: "policy" },
        h("style", {}, policyStyle),

        // Hero
        h(
          "section",
          { className: "policy-hero" },
          h(
            "div",
            { className: "container" },
            h(
              "p",
              { className: "policy-hero__eyebrow" },
              hero.eyebrow || ""
            ),
            h(
              "h1",
              { className: "policy-hero__heading" },
              hero.heading || ""
            ),
            h(
              "p",
              Object.assign(
                { className: "policy-hero__lede" },
                html(renderInline(hero.lede))
              )
            )
          )
        ),

        // Evidence — two rows
        h(
          "section",
          { className: "policy-evidence" },
          h(
            "div",
            { className: "container" },
            h(
              "p",
              { className: "policy-section__eyebrow" },
              "The data"
            ),
            h(
              "h2",
              { className: "policy-section__heading" },
              evidence.heading || ""
            ),
            h(
              "p",
              Object.assign(
                { className: "policy-section__lede" },
                html(renderInline(evidence.lede))
              )
            ),
            evidence.risk_adjusted &&
              h(
                "h3",
                { className: "evidence-row-label" },
                evidence.risk_adjusted.label || ""
              ),
            evidence.risk_adjusted &&
              h(
                "div",
                { className: "citations" },
                renderCitations(evidence.risk_adjusted.citations)
              ),
            evidence.detroit_specific &&
              h(
                "h3",
                { className: "evidence-row-label" },
                evidence.detroit_specific.label || ""
              ),
            evidence.detroit_specific &&
              h(
                "div",
                { className: "citations" },
                renderCitations(evidence.detroit_specific.citations)
              )
          )
        ),

        // 2019 reform
        h(
          "section",
          { className: "policy-2019" },
          h(
            "div",
            { className: "container" },
            h(
              "p",
              { className: "policy-section__eyebrow" },
              "Why this isn't already fixed"
            ),
            h(
              "h2",
              { className: "policy-section__heading" },
              reform.heading || ""
            ),
            h("div", html(renderBody(reform.body)))
          )
        ),

        // Pillars
        h(
          "section",
          { className: "policy-pillars" },
          h(
            "div",
            { className: "container" },
            h(
              "p",
              { className: "policy-section__eyebrow" },
              "The proposal"
            ),
            h(
              "h2",
              { className: "policy-section__heading" },
              pillars.heading || ""
            ),
            h(
              "p",
              Object.assign(
                { className: "policy-section__lede" },
                html(renderInline(pillars.lede))
              )
            ),
            h(
              "div",
              {},
              (pillars.items || []).map(function (p, i) {
                return h(
                  "article",
                  { key: i, className: "pillar" },
                  h(
                    "div",
                    { className: "pillar__num" },
                    p.number || ""
                  ),
                  h(
                    "div",
                    {},
                    h(
                      "h3",
                      { className: "pillar__heading" },
                      p.heading || ""
                    ),
                    h(
                      "div",
                      Object.assign(
                        { className: "pillar__body" },
                        html(renderBody(p.body))
                      )
                    )
                  )
                );
              })
            )
          )
        ),

        // Theory of change
        h(
          "section",
          { className: "policy-theory" },
          h(
            "div",
            { className: "container" },
            h(
              "p",
              { className: "policy-section__eyebrow" },
              "The path"
            ),
            h(
              "h2",
              { className: "policy-section__heading" },
              theory.heading || ""
            ),
            h("div", html(renderBody(theory.body)))
          )
        ),

        // Closing CTA
        h(
          "section",
          { className: "policy-cta" },
          h(
            "div",
            { className: "container" },
            h(
              "h2",
              { className: "policy-cta__heading" },
              cta.heading || ""
            ),
            h("div", html(renderBody(cta.body))),
            h(
              "div",
              { style: { display: "flex", gap: "0.875rem", marginTop: "1.5rem" } },
              cta.primary_label &&
                h(
                  "a",
                  { className: "button button--primary", href: "#" },
                  cta.primary_label
                ),
              cta.secondary_label &&
                h(
                  "a",
                  { className: "button button--secondary", href: "#" },
                  cta.secondary_label
                )
            )
          )
        )
      );
    }

    // ── REGISTER ───────────────────────────────────────────────────
    // Compute the deploy prefix from the current admin URL so the
    // same code works at /admin/, /hep4rep/admin/, /anything/admin/.
    // window.location.pathname on the admin page is "<prefix>/admin/";
    // strip the trailing /admin/ to get the prefix.
    const prefix = window.location.pathname.replace(/\/admin\/?$/, "");

    window.CMS.registerPreviewStyle(prefix + "/styles/base.css");
    window.CMS.registerPreviewStyle(prefix + "/styles/components.css");
    window.CMS.registerPreviewStyle(prefix + "/styles/theme.css");
    // Montserrat + Inter are self-hosted via @font-face declarations
    // inside base.css — no third-party font CDN.

    window.CMS.registerPreviewTemplate("home", HomePreview);
    window.CMS.registerPreviewTemplate("about", AboutPreview);
    window.CMS.registerPreviewTemplate(
      "policy_auto_insurance",
      PolicyAutoInsurancePreview
    );
  };
})();
