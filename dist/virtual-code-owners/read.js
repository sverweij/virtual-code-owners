import { readFileSync } from "node:fs";
import { EOL } from "node:os";
import { parse as parseVirtualCodeOwners } from "./parse.js";
import { getAnomalies } from "./anomalies.js";
export default function readVirtualCodeOwners(pVirtualCodeOwnersFileName, pTeamMap) {
    const lVirtualCodeOwnersAsAString = readFileSync(pVirtualCodeOwnersFileName, {
        encoding: "utf-8",
    });
    const lVirtualCodeOwners = parseVirtualCodeOwners(lVirtualCodeOwnersAsAString, pTeamMap);
    const lAnomalies = getAnomalies(lVirtualCodeOwners);
    if (lAnomalies.length > 0) {
        throw new Error(`This is not a valid virtual code-owners file:${EOL}${reportAnomalies(pVirtualCodeOwnersFileName, lAnomalies)}`);
    }
    return lVirtualCodeOwners;
}
function reportAnomalies(pFileName, pAnomalies) {
    return pAnomalies
        .map((pAnomaly) => {
        if (pAnomaly.type === "invalid-line") {
            return `${pFileName}:${pAnomaly.line}:1 invalid line - neither a rule, comment nor empty: "${pAnomaly.raw}"`;
        }
        else {
            return (`${pFileName}:${pAnomaly.line}:1 invalid user or team name "${pAnomaly.raw}" (#${pAnomaly.userNumberWithinLine} on this line). ` +
                `It should either start with "@" or be an e-mail address.`);
        }
    })
        .join(EOL);
}