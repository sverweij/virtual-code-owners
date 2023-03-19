import { equal } from "node:assert";
import { EOL } from "node:os";
import { convert, ITeamMap } from "./convert-virtual-code-owners.js";

describe("convert-virtual-code-owners converts", () => {
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
libs/sales @jan @pier @tjorus @korneel @the-cat
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
    const lExpected = "tools/shared @jan @pier @tjorus @wim @zus @jet";
    equal(convert(lFixture, lTeamMapFixture, ""), lExpected);
  });

  it("correctly replaces a team name that is a substring of another one", () => {
    const lFixture = "tools/shared @substring";
    const lTeamMapFixture = {
      sub: ["jan", "pier", "tjorus"],
      substring: ["wim", "zus", "jet"],
    };
    const lExpected = "tools/shared @wim @zus @jet";
    equal(convert(lFixture, lTeamMapFixture, ""), lExpected);
  });

  it("replaces team names & deduplicates usernames when there's > 1 team on the line", () => {
    const lFixture = "tools/shared @team-sales @team-after-sales             ";
    const lTeamMapFixture = {
      "team-sales": ["jan", "multi-teamer", "tjorus"],
      "team-after-sales": ["multi-teamer", "wim", "zus", "jet"],
    };
    const lExpected = "tools/shared @jan @multi-teamer @tjorus @wim @zus @jet";
    equal(convert(lFixture, lTeamMapFixture, ""), lExpected);
  });

  it("does not replace file names that happen to be a team name as well", () => {
    const lFixture = "@team-sales @team-after-sales";
    const lTeamMapFixture = {
      "team-sales": ["jan", "multi-teamer", "tjorus"],
      "team-after-sales": ["multi-teamer", "wim", "zus", "jet"],
    };
    const lExpected = "@team-sales @multi-teamer @wim @zus @jet";
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
      "tools/shared     @jan @multi-teamer @tjorus @wim @zus @jet";
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
    const lFixture = "tools/shared @team-sales @team-after-sales";
    const lTeamMapFixture = {};
    const lWarningText = `# warning - generated, do not edit${EOL}`;
    const lExpected = `${lWarningText}${lFixture}`;

    equal(convert(lFixture, lTeamMapFixture, lWarningText), lExpected);
  });
});
