import { EOL } from "node:os";
const DEFAULT_WARNING = `#${EOL}` +
    `# DO NOT EDIT - this file is generated and your edits will be overwritten${EOL}` +
    `#${EOL}` +
    `# To make changes:${EOL}` +
    `#${EOL}` +
    `#   - edit .github/VIRTUAL-CODEOWNERS.txt${EOL}` +
    `#   - and/ or add teams (& members) to .github/virtual-teams.yml${EOL}` +
    `#   - run 'npx virtual-code-owners --emitLabeler'${EOL}` +
    `#${EOL}${EOL}`;
export default function generateLabelerYml(pCodeOwners, pTeamMap, pGeneratedWarning = DEFAULT_WARNING) {
    let lReturnValue = pGeneratedWarning;
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
        return (pLine.type === "rule" &&
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
        lReturnValue = `"${lReturnValue}"`;
    }
    if (pOriginalString.endsWith("/")) {
        lReturnValue = `${lReturnValue}**`;
    }
    return lReturnValue;
}
function lineContainsTeamName(pLine, pTeamName) {
    return pLine.users.some((pUser) => pUser.type === "virtual-team-name" && pUser.bareName === pTeamName);
}
