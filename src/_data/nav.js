const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

module.exports = function () {
  const file = path.join(__dirname, "..", "..", "content", "settings", "nav.yml");
  return yaml.load(fs.readFileSync(file, "utf8"));
};
