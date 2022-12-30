import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { convert } from "./convert-virtual-code-owners.js";
export function readAndConvert(pVirtualCodeOwnersFileName, pVirtualTeamsFileName) {
    const lVirtualCodeOwnersFileAsAString = readFileSync(pVirtualCodeOwnersFileName, {
        encoding: "utf-8",
    });
    const lVirtualTeamsYamlAsAString = readFileSync(pVirtualTeamsFileName, {
        encoding: "utf-8",
    });
    const lTeamMap = yaml.load(lVirtualTeamsYamlAsAString);
    return convert(lVirtualCodeOwnersFileAsAString, lTeamMap);
}
