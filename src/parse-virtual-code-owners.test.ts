import { deepEqual } from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, it } from "node:test";
import { parse as parseYaml } from "yaml";
import { parse } from "./parse-virtual-code-owners.js";

function relEmpty(pFileName) {
  return new URL(
    join("__fixtures__/corpus/empty-teams", pFileName),
    import.meta.url,
  );
}
function rel(pFileName) {
  return new URL(join("__fixtures__/corpus/teams", pFileName), import.meta.url);
}
function getOutputFileName(pFileName) {
  return pFileName.replace(/\.txt$/, ".yml");
}

const TEAMS_EMPTY = {};
const TEAMS = {
  baarden: ["jan", "pier", "tjorus", "korneel"],
  "leren-lezen": ["aap", "noot@example.com", "mies"],
};

describe("parses VIRTUAL-CODEOWNERS.txt - empty 'virtual teams'", () => {
  readdirSync(relEmpty(""))
    .filter(
      (pFileName: string) => extname(relEmpty(pFileName).pathname) === ".txt",
    )
    .sort()
    .forEach((pFileName: string) => {
      const lInput = readFileSync(relEmpty(pFileName), "utf-8");
      const lExpected = readFileSync(
        relEmpty(getOutputFileName(pFileName)),
        "utf-8",
      );
      it(`parses ${pFileName}`, () => {
        deepEqual(parse(lInput, TEAMS_EMPTY), parseYaml(lExpected));
      });
    });
});
describe("parses VIRTUAL-CODEOWNERS.txt - with 'virtual teams'", () => {
  readdirSync(rel(""))
    .filter((pFileName: string) => extname(rel(pFileName).pathname) === ".txt")
    .sort()
    .forEach((pFileName: string) => {
      const lInput = readFileSync(rel(pFileName), "utf-8");
      const lExpected = readFileSync(
        rel(getOutputFileName(pFileName)),
        "utf-8",
      );
      it(`parses ${pFileName}`, () => {
        deepEqual(parse(lInput, TEAMS), parseYaml(lExpected));
      });
    });
});
