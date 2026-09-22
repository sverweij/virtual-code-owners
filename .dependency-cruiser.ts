import { parse } from "yaml";
import { readFileSync } from "node:fs";
import type { IConfiguration } from "dependency-cruiser";

export default {
  forbidden: parse(
    readFileSync("./tools/dependency-cruiser-config/rules.yml", "utf-8"),
  ),
  options: parse(
    readFileSync("./tools/dependency-cruiser-config/options.yml", "utf-8"),
  ),
} as IConfiguration;
