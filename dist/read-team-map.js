import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
export default function readTeamMap(pVirtualTeamsFileName) {
    const lVirtualTeamsAsAString = readFileSync(pVirtualTeamsFileName, {
        encoding: "utf-8",
    });
    return parseYaml(lVirtualTeamsAsAString);
}
