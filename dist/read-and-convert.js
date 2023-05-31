import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { convert } from "./convert-to-codeowners.js";
export function readAndConvert(pVirtualCodeOwnersFileName, pVirtualTeamsFileName) {
    const lVirtualCodeOwnersAsAString = readFileSync(pVirtualCodeOwnersFileName, {
        encoding: "utf-8",
    });
    const lVirtualTeamsAsAString = readFileSync(pVirtualTeamsFileName, {
        encoding: "utf-8",
    });
    const lTeamMap = yaml.load(lVirtualTeamsAsAString);
    return convert(lVirtualCodeOwnersAsAString, lTeamMap);
}
