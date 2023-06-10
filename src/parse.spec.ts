import { deepStrictEqual } from "node:assert";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { extname, join } from "node:path";
import { parse } from "./parse.js";
import { parse as parseYaml } from "yaml";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function relEmpty(pFileName) {
  return join(__dirname, "__fixtures__/corpus/empty-teams", pFileName);
}
function rel(pFileName) {
  return join(__dirname, "__fixtures__/corpus/teams", pFileName);
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
    .filter((pFileName: string) => extname(relEmpty(pFileName)) === ".txt")
    .sort()
    .forEach((pFileName: string) => {
      const lInput = readFileSync(relEmpty(pFileName), "utf-8");
      const lExpected = readFileSync(
        relEmpty(getOutputFileName(pFileName)),
        "utf-8"
      );
      it(`parses ${pFileName}`, () => {
        deepStrictEqual(parse(lInput, TEAMS_EMPTY), parseYaml(lExpected));
      });
    });
});
describe("parses VIRTUAL-CODEOWNERS.txt - with 'virtual teams'", () => {
  readdirSync(rel(""))
    .filter((pFileName: string) => extname(rel(pFileName)) === ".txt")
    .sort()
    .forEach((pFileName: string) => {
      const lInput = readFileSync(rel(pFileName), "utf-8");
      const lExpected = readFileSync(
        rel(getOutputFileName(pFileName)),
        "utf-8"
      );
      it(`parses ${pFileName}`, () => {
        deepStrictEqual(parse(lInput, TEAMS), parseYaml(lExpected));
      });
    });
});
