import { EOL } from "node:os";
import type { ITeamMap } from "../team-map/team-map.js";
import { isEmailIshUsername } from "../utensils.js";
import type {
  IUser,
  IVirtualCodeOwnerLine,
  IVirtualCodeOwnersCST,
} from "../virtual-code-owners/cst.js";

const DEFAULT_WARNING =
  `#${EOL}` +
  `# DO NOT EDIT - this file is generated and your edits will be overwritten${EOL}` +
  `#${EOL}` +
  `# To make changes:${EOL}` +
  `#${EOL}` +
  `#   - edit .github/VIRTUAL-CODEOWNERS.txt${EOL}` +
  `#   - and/ or add team members to .github/virtual-teams.yml${EOL}` +
  `#   - run 'npx virtual-code-owners' (or 'npx virtual-code-owners --emitLabeler' if you also${EOL}` +
  `#     want to generate a .github/labeler.yml)${EOL}` +
  `#${EOL}${EOL}`;

export default function generateCodeOwners(
  pVirtualCodeOwners: IVirtualCodeOwnersCST,
  pTeamMap: ITeamMap,
  pGeneratedWarning: string = DEFAULT_WARNING,
): string {
  return (
    pGeneratedWarning +
    pVirtualCodeOwners
      .filter((pLine) => pLine.type !== "ignorable-comment")
      .map((pLine) => generateLine(pLine, pTeamMap))
      .join(EOL)
  );
}

function generateLine(
  pCSTLine: IVirtualCodeOwnerLine,
  pTeamMap: ITeamMap,
): string {
  if (pCSTLine.type === "rule") {
    return (
      pCSTLine.filesPattern +
      pCSTLine.spaces +
      expandTeamsToUsersString(pCSTLine.users, pTeamMap) +
      (pCSTLine.inlineComment ? ` #${pCSTLine.inlineComment}` : "")
    );
  }
  if (pCSTLine.type === "section-heading") {
    return (
      (pCSTLine.optional ? "^" : "") +
      "[" +
      pCSTLine.name +
      "]" +
      (pCSTLine.minApprovers ? `[${pCSTLine.minApprovers}]` : "") +
      pCSTLine.spaces +
      expandTeamsToUsersString(pCSTLine.users, pTeamMap) +
      (pCSTLine.inlineComment ? ` #${pCSTLine.inlineComment}` : "")
    );
  }
  return pCSTLine.raw;
}

function expandTeamsToUsersString(pUsers: IUser[], pTeamMap: ITeamMap): string {
  return uniq(pUsers.flatMap((pUser) => expandTeamToUserNames(pUser, pTeamMap)))
    .sort(compareUserNames)
    .join(" ");
}

function expandTeamToUserNames(pUser: IUser, pTeamMap: ITeamMap): string[] {
  return pUser.type === "virtual-team-name"
    ? stringifyTeamMembers(pTeamMap, pUser.bareName)
    : [pUser.raw];
}

function stringifyTeamMembers(pTeamMap: ITeamMap, pTeamName: string): string[] {
  return (pTeamMap[pTeamName] ?? []).map(userNameToCodeOwner);
}

function userNameToCodeOwner(pUserName: string): string {
  return isEmailIshUsername(pUserName) ? pUserName : `@${pUserName}`;
}

function compareUserNames(pLeftName: string, pRightName: string): number {
  return pLeftName.toLowerCase() > pRightName.toLowerCase() ? 1 : -1;
}

function uniq(pUserNames: string[]): string[] {
  return Array.from(new Set(pUserNames));
}
