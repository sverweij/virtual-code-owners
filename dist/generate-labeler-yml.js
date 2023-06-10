import { EOL } from "os";
export function generate(pCodeOwners, pTeamMap) {
    let lReturnValue = "";
    for (const lTeamName in pTeamMap) {
        const lPatternsForTeam = getPatternsForTeam(pCodeOwners, lTeamName)
            .map((pPattern) => `- ${yamlEscape(pPattern)}${EOL}`)
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
function yamlEscape(pUnescapedString) {
    let lReturnValue = pUnescapedString;
    if (pUnescapedString === "*") {
        lReturnValue = "**";
    }
    if (lReturnValue.startsWith("*")) {
        lReturnValue = `'${lReturnValue}'`;
    }
    if (pUnescapedString.endsWith("/")) {
        lReturnValue = `${lReturnValue}**`;
    }
    return lReturnValue;
}
function lineContainsTeamName(pLine, pTeamName) {
    return pLine.users.some((pUser) => pUser.type === "virtual-team-name" && pUser.bareName === pTeamName);
}
