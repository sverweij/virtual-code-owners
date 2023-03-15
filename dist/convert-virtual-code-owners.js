import { EOL } from "node:os";
const DEFAULT_GENERATED_WARNING = `#${EOL}` +
    `# DO NOT EDIT - this file is generated and your edits will be overwritten${EOL}` +
    `#${EOL}` +
    `# To make changes:${EOL}` +
    `#${EOL}` +
    `#   - edit .github/VIRTUAL-CODEOWNERS.txt${EOL}` +
    `#   - run 'npx virtual-code-owners'${EOL}` +
    `#${EOL}${EOL}`;
export function convert(pCodeOwnersFileAsString, pTeamMap, pGeneratedWarning = DEFAULT_GENERATED_WARNING) {
    return `${pGeneratedWarning}${pCodeOwnersFileAsString
        .split(EOL)
        .filter(shouldAppearInResult)
        .map(convertLine(pTeamMap))
        .map(deduplicateUserNames)
        .join(EOL)}`;
}
function shouldAppearInResult(pLine) {
    return !pLine.trimStart().startsWith("#!");
}
function convertLine(pTeamMap) {
    return (pUntreatedLine) => {
        const lTrimmedLine = pUntreatedLine.trim();
        if (lTrimmedLine.startsWith("#") || lTrimmedLine === "") {
            return pUntreatedLine;
        }
        else {
            return replaceTeamNames(pUntreatedLine, pTeamMap);
        }
    };
}
function replaceTeamNames(pLine, pTeamMap) {
    let lReturnValue = pLine;
    for (let lTeamName of Object.keys(pTeamMap)) {
        lReturnValue = lReturnValue.replace(new RegExp(`(\\s)@${lTeamName}(\\s|$)`, "g"), `$1${stringifyTeamMembers(pTeamMap, lTeamName)}$2`);
    }
    return lReturnValue;
}
function stringifyTeamMembers(pTeamMap, pTeamName) {
    return pTeamMap[pTeamName].map((pUserName) => `@${pUserName}`).join(" ");
}
function deduplicateUserNames(pLine) {
    const lTrimmedLine = pLine.trim();
    const lSplitLine = lTrimmedLine.match(/^(?<filesPattern>[^\s]+)(?<theRest>.*)$/);
    if (lTrimmedLine.startsWith("#") || !lSplitLine?.groups) {
        return pLine;
    }
    return `${lSplitLine.groups.filesPattern} ${Array.from(new Set(lSplitLine.groups.theRest.trim().split(/\s+/))).join(" ")}`;
}
