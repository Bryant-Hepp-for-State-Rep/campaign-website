// Eleventy config — Bryant Hepp campaign site.
//
// Input layout:
//   src/                 templates (.njk), layouts, partials, _data/ scripts
//   content/             markdown + YAML edited via Decap CMS
//   design-drafts/       static assets (CSS, JS, themes) carried over from
//                        the design-exploration phase
//
// Output:
//   _site/               Eleventy build output; build.sh moves to dist/

const markdownIt = require("markdown-it");

// Two markdown renderers:
//   mdInline — only inline tokens (bold, italic, link). Used for hero
//   subhead, stat label, eyebrows etc. No paragraph wrapper, no
//   block-level elements. Mirrors the "tight inline" Decap toolbar.
//
//   mdBody — paragraphs + inline. Headings, images, code blocks, lists
//   all disabled. Mirrors the "body prose" Decap toolbar.
//
// The disable() calls are the build-time enforcement of the schema's
// design-language rules: even if Bryant pastes a heading into a body
// field, it renders as paragraph text rather than breaking the
// typographic hierarchy.
const mdInline = markdownIt({ html: false, linkify: true });
const mdBody = markdownIt({ html: false, linkify: true })
  .disable(["heading", "image", "code", "fence", "hr", "table", "html_block", "html_inline"]);

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("mdInline", (text) =>
    text ? mdInline.renderInline(String(text)) : ""
  );
  eleventyConfig.addFilter("mdBody", (text) =>
    text ? mdBody.render(String(text)) : ""
  );

  // Static passthrough — Eleventy copies these directly into _site.
  // The "{ source: dest }" shape lets us flatten paths so production URLs
  // are clean (e.g. /styles/components.css, not /design-drafts/styles/...).
  eleventyConfig.addPassthroughCopy({ "design-drafts/styles": "styles" });
  eleventyConfig.addPassthroughCopy({ "design-drafts/themes": "themes" });
  eleventyConfig.addPassthroughCopy({ "design-drafts/drafts": "drafts" });
  eleventyConfig.addPassthroughCopy({ "design-drafts/logo-system.js": "logo-system.js" });
  eleventyConfig.addPassthroughCopy({ "design-drafts/wordmark-font.js": "wordmark-font.js" });

  // Decap admin loader (Step 2 — empty until config.yml is wired).
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

  // Watch content/ so editing markdown triggers a rebuild in --serve mode.
  eleventyConfig.addWatchTarget("./content/");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
