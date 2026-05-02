// Loads all priority entries from content/priorities/, returning a
// keyed object so the home page can look them up by slug.
//
// Decap's relation widget on the home page stores the slug; templates
// resolve {{ priorities[slug] }} to the full entry.

const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

module.exports = function () {
  const dir = path.join(__dirname, "..", "..", "content", "priorities");
  const out = {};
  for (const filename of fs.readdirSync(dir).sort()) {
    if (!filename.endsWith(".md")) continue;
    const data = matter(fs.readFileSync(path.join(dir, filename), "utf8")).data;
    if (!data.slug) {
      throw new Error(`Priority ${filename} is missing a slug field.`);
    }
    out[data.slug] = data;
  }
  return out;
};
