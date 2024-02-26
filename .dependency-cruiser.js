import { parse } from "yaml";
import { readFileSync } from "node:fs";

/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: parse(
    readFileSync("./tools/dependency-cruiser-config/rules.yml", "utf-8"),
  ),
  options: parse(
    readFileSync("./tools/dependency-cruiser-config/options.yml", "utf-8"),
  ),
};
