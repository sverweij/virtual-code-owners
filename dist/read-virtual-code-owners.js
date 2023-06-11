import { readFileSync } from "node:fs";
import { parse as parseVirtualCodeOwners } from "./parse.js";
export default function readVirtualCodeOwners(pVirtualCodeOwnersFileName, pTeamMap) {
    const lVirtualCodeOwnersAsAString = readFileSync(pVirtualCodeOwnersFileName, {
        encoding: "utf-8",
    });
    return parseVirtualCodeOwners(lVirtualCodeOwnersAsAString, pTeamMap);
}
