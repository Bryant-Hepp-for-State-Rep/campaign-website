// Loads all policy entries from content/policies/, returning a keyed
// object so templates can look up by slug. The home page's in-focus
// section, the /policies/ listing, and the dynamic nav link all
// resolve through this loader.

const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

module.exports = function () {
  const dir = path.join(__dirname, "..", "..", "content", "policies");
  const out = {};
  for (const filename of fs.readdirSync(dir).sort()) {
    if (!filename.endsWith(".md")) continue;
    const data = matter(fs.readFileSync(path.join(dir, filename), "utf8")).data;
    if (!data.slug) {
      throw new Error(`Policy ${filename} is missing a slug field.`);
    }
    out[data.slug] = data;
  }
  return out;
};
