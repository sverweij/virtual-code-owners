import { isEmailIshUsername } from "./utensils.js";
import { type ITeamMap } from "./types.js";
import { EOL } from "node:os";

export type ICST = ICSTLine[];
export type ICSTLine = IBoringCSTLine | IInterestingCSTLine;
interface IBoringCSTLine {
  type: "comment" | "ignorable-comment" | "unknown";
  raw: string;
}
interface IInterestingCSTLine {
  type: "rule";
  filesPattern: string;
  spaces: string;
  users: IUser[];
  raw: string;
}
type UserType = "virtual-team-name" | "e-mail-address" | "other-user-or-team";
export type IUser = {
  type: UserType;
  raw: string;
};

export function parse(
  pVirtualCodeOwnersAsString: string,
  pTeamMap: ITeamMap
): ICST {
  return pVirtualCodeOwnersAsString
    .split(EOL)
    .map((pUntreatedLine) => parseLine(pUntreatedLine, pTeamMap));
}

function parseLine(pUntreatedLine: string, pTeamMap: ITeamMap): ICSTLine {
  const lTrimmedLine = pUntreatedLine.trim();
  const lSplitLine = lTrimmedLine.match(
    /^(?<filesPattern>[^\s]+)(?<spaces>\s+)(?<userNames>.*)$/
  );

  if (lTrimmedLine.startsWith("#!")) {
    return { type: "ignorable-comment", raw: pUntreatedLine };
  }
  if (lTrimmedLine.startsWith("#")) {
    return { type: "comment", raw: pUntreatedLine };
  }
  if (!lSplitLine?.groups) {
    return { type: "unknown", raw: pUntreatedLine };
  }

  return {
    type: "rule",
    filesPattern: lSplitLine.groups.filesPattern,
    spaces: lSplitLine.groups.spaces,
    users: parseUsers(lSplitLine.groups.userNames, pTeamMap),
    raw: pUntreatedLine,
  };
}

function parseUsers(pUserNamesString: string, pTeamMap: ITeamMap): IUser[] {
  const lUserNames = pUserNamesString.split(/\s+/);
  return lUserNames.map((pUserName) => ({
    type: getUserNameType(pUserName, pTeamMap),
    raw: pUserName,
  }));
}

function getUserNameType(pUserName: string, pTeamMap: ITeamMap): UserType {
  if (isEmailIshUsername(pUserName)) {
    return "e-mail-address";
  }

  if (pUserName.startsWith("@")) {
    const lBareUsername = pUserName.slice(1);
    if (pTeamMap.hasOwnProperty(lBareUsername)) {
      return "virtual-team-name";
    }
  }

  return "other-user-or-team";
}
