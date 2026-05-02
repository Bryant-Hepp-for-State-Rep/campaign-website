// Loads global site settings from content/settings/site.yml.
// Edited by Decap as a single-file collection.

const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

module.exports = function () {
  const file = path.join(__dirname, "..", "..", "content", "settings", "site.yml");
  return yaml.load(fs.readFileSync(file, "utf8"));
};
