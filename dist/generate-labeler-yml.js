import { EOL } from "node:os";
export function generate(pCodeOwners, pTeamMap) {
    let lReturnValue = "";
    for (const lTeamName in pTeamMap) {
        const lPatternsForTeam = getPatternsForTeam(pCodeOwners, lTeamName)
            .map((pPattern) => `  - ${transformForYamlAndMinimatch(pPattern)}${EOL}`)
            .join("");
        if (lPatternsForTeam) {
            lReturnValue += `${lTeamName}:${EOL}${lPatternsForTeam}${EOL}`;
        }
    }
    return lReturnValue;
}
function getPatternsForTeam(pCodeOwners, pTeamName) {
    return (pCodeOwners
        .filter((pLine) => {
        const isARule = pLine.type === "rule";
        return (isARule &&
            lineContainsTeamName(pLine, pTeamName));
    })
        .map((pLine) => pLine.filesPattern));
}
function transformForYamlAndMinimatch(pOriginalString) {
    let lReturnValue = pOriginalString;
    if (pOriginalString === "*") {
        lReturnValue = "**";
    }
    if (lReturnValue.startsWith("*")) {
        lReturnValue = `'${lReturnValue}'`;
    }
    if (pOriginalString.endsWith("/")) {
        lReturnValue = `${lReturnValue}**`;
    }
    return lReturnValue;
}
function lineContainsTeamName(pLine, pTeamName) {
    return pLine.users.some((pUser) => pUser.type === "virtual-team-name" && pUser.bareName === pTeamName);
}
