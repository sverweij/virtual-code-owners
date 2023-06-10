import { EOL } from "node:os";
import { isEmailIshUsername } from "./utensils.js";
import type {
  ITeamMap,
  IVirtualCodeOwnerLine,
  IUser,
  IVirtualCodeOwnersCST,
} from "types/types.js";

const DEFAULT_WARNING =
  `#${EOL}` +
  `# DO NOT EDIT - this file is generated and your edits will be overwritten${EOL}` +
  `#${EOL}` +
  `# To make changes:${EOL}` +
  `#${EOL}` +
  `#   - edit .github/VIRTUAL-CODEOWNERS.txt${EOL}` +
  `#   - and/ or add team members to .github/virtual-teams.yml${EOL}` +
  `#   - run 'npx virtual-code-owners'${EOL}` +
  `#${EOL}${EOL}`;

export function generate(
  pVirtualCodeOwners: IVirtualCodeOwnersCST,
  pTeamMap: ITeamMap,
  pGeneratedWarning: string = DEFAULT_WARNING
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
  pTeamMap: ITeamMap
): string {
  if (pCSTLine.type === "rule") {
    const lUserNames = uniq(
      pCSTLine.users.flatMap((pUser) => expandTeamToUserNames(pUser, pTeamMap))
    )
      .sort()
      .join(" ");
    return pCSTLine.filesPattern + pCSTLine.spaces + lUserNames;
  }
  return pCSTLine.raw;
}

function expandTeamToUserNames(pUser: IUser, pTeamMap: ITeamMap): string[] {
  if (pUser.type == "virtual-team-name") {
    return stringifyTeamMembers(pTeamMap, pUser.bareName);
  }
  return [pUser.raw];
}

function stringifyTeamMembers(pTeamMap: ITeamMap, pTeamName: string): string[] {
  return pTeamMap[pTeamName].map(userNameToCodeOwner);
}

function userNameToCodeOwner(pUserName: string): string {
  if (isEmailIshUsername(pUserName)) {
    return pUserName;
  }
  return `@${pUserName}`;
}

function uniq(pUserNames: string[]): string[] {
  return Array.from(new Set(pUserNames));
}
