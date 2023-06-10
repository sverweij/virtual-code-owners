import { isEmailIshUsername } from "./utensils.js";
import type { ITeamMap, ICST, ICSTLine, IUser, UserType } from "./types.js";
import { EOL } from "node:os";

export function parse(
  pVirtualCodeOwnersAsString: string,
  pTeamMap: ITeamMap = {}
): ICST {
  return pVirtualCodeOwnersAsString
    .split(EOL)
    .map((pUntreatedLine, pLineNo) =>
      parseLine(pUntreatedLine, pTeamMap, pLineNo + 1)
    );
}

function parseLine(
  pUntreatedLine: string,
  pTeamMap: ITeamMap,
  pLineNo: number
): ICSTLine {
  const lTrimmedLine = pUntreatedLine.trim();
  const lSplitLine = lTrimmedLine.match(
    /^(?<filesPattern>[^\s]+)(?<spaces>\s+)(?<userNames>.*)$/
  );

  if (lTrimmedLine.startsWith("#!")) {
    return { type: "ignorable-comment", line: pLineNo, raw: pUntreatedLine };
  }
  if (lTrimmedLine.startsWith("#")) {
    return { type: "comment", line: pLineNo, raw: pUntreatedLine };
  }
  if (!lSplitLine?.groups) {
    if (lTrimmedLine === "") {
      return { type: "empty", line: pLineNo, raw: pUntreatedLine };
    }
    return { type: "unknown", line: pLineNo, raw: pUntreatedLine };
  }

  return {
    type: "rule",
    line: pLineNo,
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
