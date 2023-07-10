import { EOL } from "node:os";
import type {
  IAnomaly,
  ILineAnomaly,
  ITeamMap,
  IUser,
  IUserAnomaly,
  IVirtualCodeOwnerLine,
  IVirtualCodeOwnersCST,
  UserType,
} from "types/types.js";
import { isEmailIshUsername } from "./utensils.js";

export function parse(
  pVirtualCodeOwnersAsString: string,
  pTeamMap: ITeamMap = {},
): IVirtualCodeOwnersCST {
  return pVirtualCodeOwnersAsString
    .split(EOL)
    .map((pUntreatedLine, pLineNo) =>
      parseLine(pUntreatedLine, pTeamMap, pLineNo + 1),
    );
}

export function getAnomalies(
  pVirtualCodeOwners: IVirtualCodeOwnersCST,
): IAnomaly[] {
  const weirdLines = pVirtualCodeOwners
    .filter((pLine) => pLine.type === "unknown")
    .map((pLine) => ({
      ...pLine,
      type: "invalid-line",
    })) as ILineAnomaly[];
  const weirdUsers = pVirtualCodeOwners.flatMap((pLine) => {
    if (pLine.type === "rule") {
      return pLine.users
        .filter((pUser) => pUser.type === "invalid")
        .map((pUser) => ({
          ...pUser,
          line: pLine.line,
          type: "invalid-user",
        }));
    }
    return [];
  }) as IUserAnomaly[];
  return (weirdLines as IAnomaly[]).concat(weirdUsers).sort(orderAnomaly);
}

function orderAnomaly(pLeft: IAnomaly, pRight: IAnomaly): number {
  if (
    pLeft.line === pRight.line &&
    pLeft.type === "invalid-user" &&
    pRight.type === "invalid-user"
  ) {
    return pLeft.userNumberWithinLine > pRight.userNumberWithinLine ? 1 : -1;
  } else {
    return pLeft.line > pRight.line ? 1 : -1;
  }
}

function parseLine(
  pUntreatedLine: string,
  pTeamMap: ITeamMap,
  pLineNo: number,
): IVirtualCodeOwnerLine {
  const lTrimmedLine = pUntreatedLine.trim();
  const lSplitLine = lTrimmedLine.match(
    /^(?<filesPattern>[^\s]+)(?<spaces>\s+)(?<userNames>.*)$/,
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
  return lUserNames.map((pUserName, pIndex) => {
    const lBareName = getBareUserName(pUserName);
    return {
      type: getUserNameType(pUserName, lBareName, pTeamMap),
      userNumberWithinLine: pIndex + 1,
      bareName: lBareName,
      raw: pUserName,
    };
  });
}

function getUserNameType(
  pUserName: string,
  pBareName: string,
  pTeamMap: ITeamMap,
): UserType {
  if (isEmailIshUsername(pUserName)) {
    return "e-mail-address";
  }

  if (pUserName.startsWith("@")) {
    if (pTeamMap.hasOwnProperty(pBareName)) {
      return "virtual-team-name";
    }
    return "other-user-or-team";
  }
  // usernames either start with an @ or are an e-mail address. When you're
  // here the pUserName is neither so it's bound to be not valid
  return "invalid";
}

function getBareUserName(pUserName: string): string {
  if (pUserName.startsWith("@")) {
    return pUserName.slice(1);
  }
  return pUserName;
}
