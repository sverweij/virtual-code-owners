import { EOL } from "node:os";
const DEFAULT_WARNING = `#${EOL}` +
    `# DO NOT EDIT - this file is generated and your edits will be overwritten${EOL}` +
    `#${EOL}` +
    `# To make changes:${EOL}` +
    `#${EOL}` +
    `#   - edit .github/VIRTUAL-CODEOWNERS.txt${EOL}` +
    `#   - and/ or add team members to .github/virtual-teams.yml${EOL}` +
    `#   - run 'npx virtual-code-owners'${EOL}` +
    `#${EOL}${EOL}`;
export function convert(pCodeOwnersFileAsString, pTeamMap, pGeneratedWarning = DEFAULT_WARNING) {
    return (pGeneratedWarning +
        pCodeOwnersFileAsString
            .split(EOL)
            .filter(shouldAppearInResult)
            .map(convertLine(pTeamMap))
            .join(EOL));
}
function shouldAppearInResult(pLine) {
    return !pLine.trimStart().startsWith("#!");
}
function convertLine(pTeamMap) {
    return (pUntreatedLine) => {
        const lTrimmedLine = pUntreatedLine.trim();
        const lSplitLine = lTrimmedLine.match(/^(?<filesPattern>[^\s]+\s+)(?<userNames>.*)$/);
        if (lTrimmedLine.startsWith("#") || !lSplitLine?.groups) {
            return pUntreatedLine;
        }
        const lUserNames = replaceTeamNames(lSplitLine.groups.userNames, pTeamMap);
        return lSplitLine.groups.filesPattern + uniqAndSortUserNames(lUserNames);
    };
}
function replaceTeamNames(pUserNames, pTeamMap) {
    let lReturnValue = pUserNames;
    for (let lTeamName of Object.keys(pTeamMap)) {
        lReturnValue = lReturnValue.replace(new RegExp(`(\\s|^)@${lTeamName}(\\s|$)`, "g"), `$1${stringifyTeamMembers(pTeamMap, lTeamName)}$2`);
    }
    return lReturnValue;
}
function stringifyTeamMembers(pTeamMap, pTeamName) {
    return pTeamMap[pTeamName].map((pUserName) => `@${pUserName}`).join(" ");
}
function uniqAndSortUserNames(pUserNames) {
    return Array.from(new Set(pUserNames.split(/\s+/)))
        .sort()
        .join(" ");
}
