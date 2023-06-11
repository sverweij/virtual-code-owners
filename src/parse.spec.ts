import { deepStrictEqual } from "node:assert";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import type { IVirtualCodeOwnersCST } from "../types/types.js";
import { getAnomalies, parse } from "./parse.js";

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

describe("anomaly detection", () => {
  it("reports an invalid line", () => {
    const erroneousLine = "this-is-not-a-valid-rule-or-comment";
    const lVirtualCodeOwners = parse(erroneousLine);
    const lFound = getAnomalies(lVirtualCodeOwners);
    const lExpected = [
      {
        type: "invalid-line",
        line: 1,
        raw: "this-is-not-a-valid-rule-or-comment",
      },
    ];
    deepStrictEqual(lFound, lExpected);
  });

  it("reports an invalid user", () => {
    const erroneousLine = "some/pattern/ username-without-an-at";
    const lVirtualCodeOwners = parse(erroneousLine);
    const lFound = getAnomalies(lVirtualCodeOwners);
    const lExpected = [
      {
        type: "invalid-user",
        line: 1,
        userNumberWithinLine: 1,
        bareName: "username-without-an-at",
        raw: "username-without-an-at",
      },
    ];
    deepStrictEqual(lFound, lExpected);
  });

  it("reports invalid users and lines (ordered by line number, username on that line)", () => {
    const lInput = `some/pattern/  tjorus@example.com username-without-an-at @normal-username
      some/other/pattern @team1 without-at @team2   team3-but-without-an-at 
      #comment - next line is empty

      #!ignorable-comment
      # next line is an error
      -
      # as is the next one
      aintthatcutebutitisWRONG
      `;
    const lVirtualCodeOwners = parse(lInput);
    const lFound = getAnomalies(lVirtualCodeOwners);
    const lExpected = [
      {
        type: "invalid-user",
        line: 1,
        userNumberWithinLine: 2,
        bareName: "username-without-an-at",
        raw: "username-without-an-at",
      },
      {
        type: "invalid-user",
        line: 2,
        userNumberWithinLine: 2,
        bareName: "without-at",
        raw: "without-at",
      },
      {
        type: "invalid-user",
        line: 2,
        userNumberWithinLine: 4,
        bareName: "team3-but-without-an-at",
        raw: "team3-but-without-an-at",
      },
      {
        type: "invalid-line",
        line: 7,
        raw: "      -",
      },
      {
        type: "invalid-line",
        line: 9,
        raw: "      aintthatcutebutitisWRONG",
      },
    ];
    deepStrictEqual(lFound, lExpected);
  });

  it("reports users in the same order as they appear", () => {
    const lVirtualCodeOwners: IVirtualCodeOwnersCST = [
      {
        type: "rule",
        filesPattern: "yadda/yadda/",
        line: 1,
        raw: "yadda/yadda/ @one @atwo three @four @five six @seven eight",
        spaces: " ",
        users: [
          {
            type: "other-user-or-team",
            bareName: "one",
            userNumberWithinLine: 1,
            raw: "@one",
          },
          {
            type: "invalid",
            bareName: "three",
            userNumberWithinLine: 3,
            raw: "three",
          },
          {
            type: "other-user-or-team",
            bareName: "four",
            userNumberWithinLine: 4,
            raw: "four",
          },
          {
            type: "invalid",
            bareName: "eight",
            userNumberWithinLine: 8,
            raw: "eight",
          },
          {
            type: "other-user-or-team",
            bareName: "five",
            userNumberWithinLine: 5,
            raw: "@five",
          },
          {
            type: "invalid",
            bareName: "six",
            userNumberWithinLine: 6,
            raw: "six",
          },
          {
            type: "other-user-or-team",
            bareName: "seven",
            userNumberWithinLine: 7,
            raw: "@seven",
          },
          {
            type: "other-user-or-team",
            bareName: "two",
            userNumberWithinLine: 2,
            raw: "@two",
          },
        ],
      },
    ];
    const lFound = getAnomalies(lVirtualCodeOwners);
    const lExpected = [
      {
        type: "invalid-user",
        line: 1,
        userNumberWithinLine: 3,
        bareName: "three",
        raw: "three",
      },
      {
        type: "invalid-user",
        line: 1,
        userNumberWithinLine: 6,
        bareName: "six",
        raw: "six",
      },
      {
        type: "invalid-user",
        line: 1,
        userNumberWithinLine: 8,
        bareName: "eight",
        raw: "eight",
      },
    ];
    deepStrictEqual(lFound, lExpected);
  });
});
