import { EOL } from "node:os";
const DEFAULT_GENERATED_WARNING = `#${EOL}` +
    `# DO NOT EDIT - this file is generated and your edits will be overwritten${EOL}` +
    `#${EOL}` +
    `# To make changes:${EOL}` +
    `#${EOL}` +
    `#   - edit VIRTUAL-CODEOWNERS.txt${EOL}` +
    `#   - run 'npx virtual-code-owners VIRTUAL-CODE-OWNERS.txt virtual-teams.yml > CODEOWNERS'${EOL}` +
    `#${EOL}${EOL}`;
function replaceTeamNames(pLine, pTeamMap) {
    let lReturnValue = pLine;
    for (let lTeamName of Object.keys(pTeamMap)) {
        lReturnValue = lReturnValue.replace(`@${lTeamName}`, pTeamMap[lTeamName].map((pUserName) => `@${pUserName}`).join(" "));
    }
    return lReturnValue;
}
function convertLine(pTeamMap) {
    return (pUntreatedLine) => {
        const lTrimmedLine = pUntreatedLine.trimStart();
        if (lTrimmedLine.startsWith("#") || lTrimmedLine === "") {
            return pUntreatedLine;
        }
        else {
            return replaceTeamNames(pUntreatedLine, pTeamMap);
        }
    };
}
function isNotIgnorable(pLine) {
    return !pLine.trimStart().startsWith("#!");
}
export function convert(pCodeOwnersFileAsString, pTeamMap, pGeneratedWarning = DEFAULT_GENERATED_WARNING) {
    return `${pGeneratedWarning}${pCodeOwnersFileAsString
        .split(EOL)
        .filter(isNotIgnorable)
        .map(convertLine(pTeamMap))
        .join(EOL)}`;
}
