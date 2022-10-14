import { equal } from "node:assert";
import { convert, ITeamMap } from "./convert-virtual-code-owners.js";
describe("doSomething does something", () => {
  const lCodeOwners = `# here's a comment
* @everyone
# regular functionality
libs/sales @team-sales @the-cat
libs/after-sales @team-after-sales

# tooling maintained by a rag tag band of 20% friday afternooners
tools/ @team-tgif`;

  it("leaves an code owners as-is when the team map is empty", () => {
    equal(convert(lCodeOwners, {}), lCodeOwners);
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
    equal(convert(lCodeOwners, lTeamMap), lExpected);
  });

  it("replaces team names when there's > 1 team on the line", () => {
    const lFixture = "tools/shared @team-sales @team-after-sales";
    const lTeamMapFixture = {
      "team-sales": ["jan", "pier", "tjorus"],
      "team-after-sales": ["wim", "zus", "jet"],
    };
    const lExpected = "tools/shared @jan @pier @tjorus @wim @zus @jet";
    equal(convert(lFixture, lTeamMapFixture), lExpected);
  });

  it.skip("replaces team names & deduplicates usernames when there's > 1 team on the line => doesn't seem necessary; repeating usernames seem OK", () => {
    const lFixture = "tools/shared @team-sales @team-after-sales";
    const lTeamMapFixture = {
      "team-sales": ["jan", "multi-teamer", "tjorus"],
      "team-after-sales": ["multi-teamer", "wim", "zus", "jet"],
    };
    const lExpected = "tools/shared @jan @multi-teamer @tjorus @wim @zus @jet";
    equal(convert(lFixture, lTeamMapFixture), lExpected);
  });
});
