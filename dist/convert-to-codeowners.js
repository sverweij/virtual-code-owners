import { EOL } from "node:os";
import { isEmailIshUsername } from "./utensils.js";
import { parse } from "./parse.js";
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
    const lCST = parse(pCodeOwnersFileAsString, pTeamMap);
    return (pGeneratedWarning +
        lCST
            .filter((pLine) => pLine.type !== "ignorable-comment")
            .map((pLine) => convertLine(pLine, pTeamMap))
            .join(EOL));
}
function convertLine(pCSTLine, pTeamMap) {
    if (pCSTLine.type === "rule") {
        const lUserNames = uniq(pCSTLine.users.flatMap((pUser) => expandTeamToUserNames(pUser, pTeamMap)))
            .sort()
            .join(" ");
        return pCSTLine.filesPattern + pCSTLine.spaces + lUserNames;
    }
    return pCSTLine.raw;
}
function expandTeamToUserNames(pUser, pTeamMap) {
    if (pUser.type == "virtual-team-name") {
        return stringifyTeamMembers(pTeamMap, pUser.raw.slice(1));
    }
    return [pUser.raw];
}
function stringifyTeamMembers(pTeamMap, pTeamName) {
    return pTeamMap[pTeamName].map(userNameToCodeOwner);
}
function userNameToCodeOwner(pUserName) {
    if (isEmailIshUsername(pUserName)) {
        return pUserName;
    }
    return `@${pUserName}`;
}
function uniq(pUserNames) {
    return Array.from(new Set(pUserNames));
}
