// Reads the home page entry's frontmatter. The file body is empty —
// all content lives in structured fields so the schema can constrain
// the design language.

const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

module.exports = function () {
  const file = path.join(__dirname, "..", "..", "content", "pages", "home.md");
  return matter(fs.readFileSync(file, "utf8")).data;
};
