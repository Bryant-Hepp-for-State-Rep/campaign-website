const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");

module.exports = function () {
  const file = path.join(__dirname, "..", "..", "content", "pages", "policy-auto-insurance.md");
  return matter(fs.readFileSync(file, "utf8")).data;
};
