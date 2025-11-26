import { deepEqual, equal } from "node:assert/strict";
import { readFileSync } from "node:fs";
import { EOL } from "node:os";
import { describe, it } from "node:test";
import { parse as parseYaml } from "yaml";
import readTeamMap from "../team-map/read.js";
import readVirtualCodeOwners from "../codeowners/read.js";
import type { IVirtualCodeOwnersCST } from "../codeowners/cst.js";
import generateLabelerYml from "./generate.js";

const TEAMS = {
  "the-a-team": ["smith", "baracus", "peck", "murdock"],
  baarden: ["jan", "pier", "tjorus", "korneel"],
};

describe("generate-labeler-yml generates a labeler.yml", () => {
  it("empty virtual code owners & empty teams yields empty string", () => {
    equal(generateLabelerYml([], {}, ""), "");
  });

  it("empty virtual code owners  yields empty string", () => {
    equal(generateLabelerYml([], TEAMS, ""), "");
  });

  it("virtual code owners with teams not matching any teams yields empty string", () => {
    const lVirtualCodeOwners: IVirtualCodeOwnersCST = [
      {
        type: "rule",
        line: 1,
        spaces: " ",
        raw: "knakkerdeknak/ @another-user-or-team @and-yet-another-user",
        filesPattern: "knakkerdeknak/",
        inlineComment: "",
        users: [
          {
            type: "other-user-or-team",
            userNumberWithinLine: 1,
            bareName: "another-user-or-team",
            raw: "@another-user-or-team",
          },
          {
            type: "virtual-team-name",
            userNumberWithinLine: 1,
            bareName: "and-yet-another-user-or-team",
            raw: "@another-user-or-team",
          },
        ],
      },
    ];
    equal(generateLabelerYml(lVirtualCodeOwners, TEAMS, ""), "");
  });

  it("virtual code owners with teams matching a rule yields the file pattern for that team", () => {
    const lVirtualCodeOwners: IVirtualCodeOwnersCST = [
      {
        type: "rule",
        line: 1,
        spaces: " ",
        raw: "knakkerdeknak/ @the-a-team @the-a-team pier@example.com",
        filesPattern: "knakkerdeknak/",
        inlineComment: "",
        users: [
          {
            type: "virtual-team-name",
            userNumberWithinLine: 1,
            bareName: "the-a-team",
            raw: "@the-a-team",
          },
          {
            type: "virtual-team-name",
            userNumberWithinLine: 2,
            bareName: "the-b-team",
            raw: "@the-b-team",
          },
          {
            type: "e-mail-address",
            userNumberWithinLine: 3,
            bareName: "pier@example.com",
            raw: "pier@example.com",
          },
        ],
      },
    ];
    const lExpected = `the-a-team:
  - changed-files:
      - any-glob-to-any-file: knakkerdeknak/**

`;
    equal(generateLabelerYml(lVirtualCodeOwners, TEAMS, ""), lExpected);
  });

  it("virtual code owners with teams matching a rule yields the file pattern for that team", () => {
    const lVirtualCodeOwners: IVirtualCodeOwnersCST = [
      {
        type: "rule",
        line: 3,
        spaces: " ",
        raw: "knakkerdeknak/ @the-a-team @the-a-team pier@example.com",
        filesPattern: "knakkerdeknak/",
        inlineComment: "",
        users: [
          {
            type: "virtual-team-name",
            userNumberWithinLine: 2,
            bareName: "the-b-team",
            raw: "@the-b-team",
          },
          {
            type: "e-mail-address",
            userNumberWithinLine: 3,
            bareName: "pier@example.com",
            raw: "pier@example.com",
          },
        ],
        inheritedUsers: [
          {
            type: "virtual-team-name",
            userNumberWithinLine: 1,
            bareName: "the-a-team",
            raw: "@the-a-team",
          },
        ],
      },
    ];
    const lExpected = `the-a-team:
  - changed-files:
      - any-glob-to-any-file: knakkerdeknak/**

`;
    equal(generateLabelerYml(lVirtualCodeOwners, TEAMS, ""), lExpected);
  });

  it("rewrites glob magic from what gitignore/ codeowners uses what minimatch understands - '*'", () => {
    const lVirtualCodeOwners: IVirtualCodeOwnersCST = [
      {
        type: "rule",
        line: 1,
        spaces: " ",
        raw: "* @baarden",
        filesPattern: "*",
        inlineComment: "",
        users: [
          {
            type: "virtual-team-name",
            userNumberWithinLine: 1,
            bareName: "baarden",
            raw: "@baarden",
          },
        ],
      },
    ];
    const lExpected = `baarden:
  - changed-files:
      - any-glob-to-any-file: "**"

`;
    equal(generateLabelerYml(lVirtualCodeOwners, TEAMS, ""), lExpected);
  });

  it("rewrites glob magic from what gitignore/ codeowners uses what minimatch understands - starts with '*'", () => {
    const lVirtualCodeOwners: IVirtualCodeOwnersCST = [
      {
        type: "rule",
        line: 1,
        spaces: " ",
        raw: "*/src/vlaai/* @baarden",
        filesPattern: "*/src/vlaai/*",
        inlineComment: "",
        users: [
          {
            type: "virtual-team-name",
            userNumberWithinLine: 1,
            bareName: "baarden",
            raw: "@baarden",
          },
        ],
      },
    ];
    const lExpected = `baarden:
  - changed-files:
      - any-glob-to-any-file: "*/src/vlaai/*"

`;
    equal(generateLabelerYml(lVirtualCodeOwners, TEAMS, ""), lExpected);
  });

  it("rewrites glob magic from what gitignore/ codeowners uses what minimatch understands - ends with '/'", () => {
    const lVirtualCodeOwners: IVirtualCodeOwnersCST = [
      {
        type: "rule",
        line: 1,
        spaces: " ",
        raw: "src/vlaai/ @baarden",
        filesPattern: "src/vlaai/",
        inlineComment: "",
        users: [
          {
            type: "virtual-team-name",
            userNumberWithinLine: 1,
            bareName: "baarden",
            raw: "@baarden",
          },
        ],
      },
    ];
    const lExpected = `# some header or other${EOL}baarden:
  - changed-files:
      - any-glob-to-any-file: src/vlaai/**

`;
    equal(
      generateLabelerYml(
        lVirtualCodeOwners,
        TEAMS,
        `# some header or other${EOL}`,
      ),
      lExpected,
    );
  });

  it("writes the kitchensink", () => {
    const lTeamMap = readTeamMap(
      new URL("./__mocks__/virtual-teams.yml", import.meta.url).pathname,
    );
    const lVirtualCodeOwners = readVirtualCodeOwners(
      new URL("./__mocks__/VIRTUAL-CODEOWNERS.txt", import.meta.url).pathname,
      lTeamMap,
    );
    const lExpected = parseYaml(
      readFileSync(
        new URL("./__fixtures__/labeler.yml", import.meta.url),
        "utf-8",
      ),
    );
    const lFound = parseYaml(generateLabelerYml(lVirtualCodeOwners, lTeamMap));
    deepEqual(lFound, lExpected);
  });
});
