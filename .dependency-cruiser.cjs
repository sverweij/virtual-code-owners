const yaml = require("js-yaml");
const { readFileSync } = require("node:fs");

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: yaml.load(
    readFileSync("./tools/dependency-cruiser-config/rules.yml", "utf-8")
  ),
  options: yaml.load(
    readFileSync("./tools/dependency-cruiser-config/options.yml", "utf-8")
  ),
};
