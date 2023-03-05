import { EOL } from "node:os";
const DEFAULT_GENERATED_WARNING = `#${EOL}` +
    `# DO NOT EDIT - this file is generated and your edits will be overwritten${EOL}` +
    `#${EOL}` +
    `# To make changes:${EOL}` +
    `#${EOL}` +
    `#   - edit .github/VIRTUAL-CODEOWNERS.txt${EOL}` +
    `#   - run 'npx virtual-code-owners'${EOL}` +
    `#${EOL}${EOL}`;
function replaceTeamNames(pLine, pTeamMap) {
    let lReturnValue = pLine;
    for (let lTeamName of Object.keys(pTeamMap)) {
        lReturnValue = lReturnValue.replace(new RegExp(`(\\s)@${lTeamName}(\\s|$)`, "g"), `$1${pTeamMap[lTeamName].map((pUserName) => `@${pUserName}`).join(" ")}$2`);
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
