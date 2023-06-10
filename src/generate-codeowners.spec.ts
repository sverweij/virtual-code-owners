import { equal } from "node:assert";
import { EOL } from "node:os";
import { generate } from "./generate-codeowners.js";
import { parse } from "./parse.js";
import type { ITeamMap } from "./types.js";

export function convert(
  pCodeOwnersFileAsString: string,
  pTeamMap: ITeamMap,
  pGeneratedWarning: string = ""
): string {
  const lVirtualCodeOwners = parse(pCodeOwnersFileAsString, pTeamMap);

  return generate(lVirtualCodeOwners, pTeamMap, pGeneratedWarning);
}

describe("generate-codeowners generates CODEOWNERS", () => {
  const lCodeOwners = `# here's a comment
* @everyone
# regular functionality
libs/sales @team-sales @the-cat
libs/after-sales @team-after-sales

# tooling maintained by a rag tag band of 20% friday afternooners
tools/ @team-tgif`;

  it("leaves an code owners as-is when the team map is empty", () => {
    equal(convert(lCodeOwners, {}, ""), lCodeOwners);
  });

  it("replaces team names with usernames as specified in the team map", () => {
    const lTeamMap: ITeamMap = {
      "team-sales": ["jan", "pier", "tjorus", "korneel"],
    };
    const lExpected = `# here's a comment
* @everyone
# regular functionality
libs/sales @jan @korneel @pier @the-cat @tjorus
libs/after-sales @team-after-sales

# tooling maintained by a rag tag band of 20% friday afternooners
tools/ @team-tgif`;
    equal(convert(lCodeOwners, lTeamMap, ""), lExpected);
  });

  it("replaces team names when there's > 1 team on the line", () => {
    const lFixture = "tools/shared @team-sales @team-after-sales";
    const lTeamMapFixture = {
      "team-sales": ["jan", "pier", "tjorus"],
      "team-after-sales": ["wim", "zus", "jet"],
    };
    const lExpected = "tools/shared @jan @jet @pier @tjorus @wim @zus";
    equal(convert(lFixture, lTeamMapFixture, ""), lExpected);
  });

  it("correctly replaces a team name that is a substring of another one", () => {
    const lFixture = "tools/shared @substring";
    const lTeamMapFixture = {
      sub: ["jan", "pier", "tjorus"],
      substring: ["wim", "zus", "jet"],
    };
    const lExpected = "tools/shared @jet @wim @zus";
    equal(convert(lFixture, lTeamMapFixture, ""), lExpected);
  });

  it("leaves e-mail addresses in the virtual-codeowners.txt alone", () => {
    const lFixture = "tools/shared @substring korneel@example.com";
    const lTeamMapFixture = {
      sub: ["jan", "pier", "tjorus"],
      substring: ["wim", "zus", "jet"],
    };
    const lExpected = "tools/shared @jet @wim @zus korneel@example.com";
    equal(convert(lFixture, lTeamMapFixture, ""), lExpected);
  });

  it("correctly replaces both user names and e-mail addresses", () => {
    const lFixture = "tools/shared @team-with-user-names-and-mail-addresses";
    const lTeamMapFixture = {
      "team-with-user-names-and-mail-addresses": [
        "jan",
        "pier@example.com",
        "tjorus",
        "korneel@example.com",
      ],
    };
    const lExpected =
      "tools/shared @jan @tjorus korneel@example.com pier@example.com";
    equal(convert(lFixture, lTeamMapFixture, ""), lExpected);
  });

  it("replaces team names & deduplicates usernames when there's > 1 team on the line", () => {
    const lFixture = "tools/shared @team-sales @team-after-sales             ";
    const lTeamMapFixture = {
      "team-sales": ["jan", "multi-teamer", "tjorus"],
      "team-after-sales": ["multi-teamer", "wim", "zus", "jet"],
    };
    const lExpected = "tools/shared @jan @jet @multi-teamer @tjorus @wim @zus";
    equal(convert(lFixture, lTeamMapFixture, ""), lExpected);
  });

  it("does not replace file names that happen to be a team name as well", () => {
    const lFixture = "@team-sales @team-after-sales";
    const lTeamMapFixture = {
      "team-sales": ["jan", "multi-teamer", "tjorus"],
      "team-after-sales": ["multi-teamer", "wim", "zus", "jet"],
    };
    const lExpected = "@team-sales @jet @multi-teamer @wim @zus";
    equal(convert(lFixture, lTeamMapFixture, ""), lExpected);
  });

  it("retains spaces between filenames and user names", () => {
    const lFixture =
      "tools/shared     @team-sales @team-after-sales             ";
    const lTeamMapFixture = {
      "team-sales": ["jan", "multi-teamer", "tjorus"],
      "team-after-sales": ["multi-teamer", "wim", "zus", "jet"],
    };
    const lExpected =
      "tools/shared     @jan @jet @multi-teamer @tjorus @wim @zus";
    equal(convert(lFixture, lTeamMapFixture, ""), lExpected);
  });

  it("leaves lines that don't have the filesPattern & usernames pattern alone", () => {
    const lFixture = "tools/shared";
    const lTeamMapFixture = {
      "team-sales": ["jan", "multi-teamer", "tjorus"],
      "team-after-sales": ["multi-teamer", "wim", "zus", "jet"],
    };
    const lExpected = "tools/shared";
    equal(convert(lFixture, lTeamMapFixture, ""), lExpected);
  });

  it("skips lines that start with '#!'", () => {
    const lFixture = `#!ignore this line${EOL}    #! and this as well${EOL}# but not this one${EOL}and/neither @this-one`;
    const lExpected = `# but not this one${EOL}and/neither @this-one`;
    equal(convert(lFixture, {}, ""), lExpected);
  });

  it("adds a warning text on top when passed one", () => {
    const lFixture = "tools/shared @team-after-sales @team-sales";
    const lTeamMapFixture = {};
    const lWarningText = `# warning - generated, do not edit${EOL}`;
    const lExpected = `${lWarningText}${lFixture}`;

    equal(convert(lFixture, lTeamMapFixture, lWarningText), lExpected);
  });
  it("sorts the usernames in place", () => {
    const lFixture = "tools/shared @team-unsorted";
    const lTeamMapFixture = {
      "team-unsorted": ["zus", "jan", "tjorus", "teun", "jet", "gijs"],
    };
    const lExpected = "tools/shared @gijs @jan @jet @teun @tjorus @zus";
    equal(convert(lFixture, lTeamMapFixture, ""), lExpected);
  });
});
