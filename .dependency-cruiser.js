import yaml from "js-yaml";
import { readFileSync } from "node:fs";

/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: yaml.load(
    readFileSync("./tools/dependency-cruiser-config/rules.yml", "utf-8")
  ),
  options: yaml.load(
    readFileSync("./tools/dependency-cruiser-config/options.yml", "utf-8")
  ),
};
