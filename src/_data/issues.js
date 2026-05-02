// Loads all signature-issue entries from content/issues/, keyed by
// slug. The home page's "in focus" section references one by slug.

const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

module.exports = function () {
  const dir = path.join(__dirname, "..", "..", "content", "issues");
  const out = {};
  for (const filename of fs.readdirSync(dir).sort()) {
    if (!filename.endsWith(".md")) continue;
    const data = matter(fs.readFileSync(path.join(dir, filename), "utf8")).data;
    if (!data.slug) {
      throw new Error(`Issue ${filename} is missing a slug field.`);
    }
    out[data.slug] = data;
  }
  return out;
};
