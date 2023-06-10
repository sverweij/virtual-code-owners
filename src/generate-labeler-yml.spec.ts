import { equal } from "node:assert";
import { generate } from "./generate-labeler-yml.js";
import { IVirtualCodeOwnersCST } from "../types/types.js";

const TEAMS = {
  "the-a-team": ["smith", "baracus", "peck", "murdock"],
  baarden: ["jan", "pier", "tjorus", "korneel"],
};

describe("generate-labeler-yml generates a labeler.yml", () => {
  it("empty virtual code owners & empty teams yields empty string", () => {
    equal(generate([], {}), "");
  });

  it("empty virtual code owners  yields empty string", () => {
    equal(generate([], TEAMS), "");
  });

  it("virtual code owners with teams not matching any teams yields empty string", () => {
    const lVirtualCodeOwners: IVirtualCodeOwnersCST = [
      {
        type: "rule",
        line: 1,
        spaces: " ",
        raw: "knakkerdeknak/ @another-user-or-team @and-yet-another-user",
        filesPattern: "knakkerdeknak/",
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
    equal(generate(lVirtualCodeOwners, TEAMS), "");
  });

  it("virtual code owners with teams matching a rule yields the file pattern for that team", () => {
    const lVirtualCodeOwners: IVirtualCodeOwnersCST = [
      {
        type: "rule",
        line: 1,
        spaces: " ",
        raw: "knakkerdeknak/ @the-a-team @the-a-team pier@example.com",
        filesPattern: "knakkerdeknak/",
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
            bareName: "the-a-team",
            raw: "@the-a-team",
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
  - knakkerdeknak/**

`;
    equal(generate(lVirtualCodeOwners, TEAMS), lExpected);
  });

  it("rewrites glob magic from what gitignore/ codeowners uses what minimatch understands - '*'", () => {
    const lVirtualCodeOwners: IVirtualCodeOwnersCST = [
      {
        type: "rule",
        line: 1,
        spaces: " ",
        raw: "* @baarden",
        filesPattern: "*",
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
  - '**'

`;
    equal(generate(lVirtualCodeOwners, TEAMS), lExpected);
  });

  it("rewrites glob magic from what gitignore/ codeowners uses what minimatch understands - starts with '*'", () => {
    const lVirtualCodeOwners: IVirtualCodeOwnersCST = [
      {
        type: "rule",
        line: 1,
        spaces: " ",
        raw: "*/src/vlaai/* @baarden",
        filesPattern: "*/src/vlaai/*",
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
  - '*/src/vlaai/*'

`;
    equal(generate(lVirtualCodeOwners, TEAMS), lExpected);
  });

  it("rewrites glob magic from what gitignore/ codeowners uses what minimatch understands - ends with '/'", () => {
    const lVirtualCodeOwners: IVirtualCodeOwnersCST = [
      {
        type: "rule",
        line: 1,
        spaces: " ",
        raw: "src/vlaai/ @baarden",
        filesPattern: "src/vlaai/",
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
  - src/vlaai/**

`;
    equal(generate(lVirtualCodeOwners, TEAMS), lExpected);
  });
});
