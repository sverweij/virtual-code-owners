import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { generate } from "./generate-codeowners.js";
import { parse as parseVirtualCodeOwners } from "./parse.js";
export default function parseAndGenerate(pVirtualCodeOwnersFileName, pVirtualTeamsFileName) {
    const lVirtualCodeOwnersAsAString = readFileSync(pVirtualCodeOwnersFileName, {
        encoding: "utf-8",
    });
    const lVirtualTeamsAsAString = readFileSync(pVirtualTeamsFileName, {
        encoding: "utf-8",
    });
    const lTeamMap = parseYaml(lVirtualTeamsAsAString);
    const lVirtualCodeOwners = parseVirtualCodeOwners(lVirtualCodeOwnersAsAString, lTeamMap);
    return generate(lVirtualCodeOwners, lTeamMap);
}
