import { EOL } from "node:os";
const DEFAULT_GENERATED_WARNING = `#${EOL}` +
    `# DO NOT EDIT - this file is generated and your edits will be overwritten${EOL}` +
    `#${EOL}` +
    `# To make changes:${EOL}` +
    `#${EOL}` +
    `#   - edit .github/VIRTUAL-CODEOWNERS.txt${EOL}` +
    `#   - and/ or add team members to .github/virtual-teams.yml${EOL}` +
    `#   - run 'npx virtual-code-owners'${EOL}` +
    `#${EOL}${EOL}`;
const LINE_PATTERN = /^(?<filesPattern>[^\s]+\s+)(?<userNames>.*)$/;
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
            return replaceTeamNames(lTrimmedLine, pTeamMap);
        }
    };
}
function replaceTeamNames(pTrimmedLine, pTeamMap) {
    const lSplitLine = pTrimmedLine.match(LINE_PATTERN);
    if (!lSplitLine?.groups) {
        return pTrimmedLine;
    }
    let lUserNames = lSplitLine.groups.userNames.trim();
    for (let lTeamName of Object.keys(pTeamMap)) {
        lUserNames = lUserNames.replace(new RegExp(`(\\s|^)@${lTeamName}(\\s|$)`, "g"), `$1${stringifyTeamMembers(pTeamMap, lTeamName)}$2`);
    }
    return `${lSplitLine.groups.filesPattern}${lUserNames}`;
}
function stringifyTeamMembers(pTeamMap, pTeamName) {
    return pTeamMap[pTeamName].map((pUserName) => `@${pUserName}`).join(" ");
}
function deduplicateUserNames(pTrimmedLine) {
    const lSplitLine = pTrimmedLine.match(LINE_PATTERN);
    if (pTrimmedLine.startsWith("#") || !lSplitLine?.groups) {
        return pTrimmedLine;
    }
    return `${lSplitLine.groups.filesPattern}${Array.from(new Set(lSplitLine.groups.userNames.trim().split(/\s+/))).join(" ")}`;
}
