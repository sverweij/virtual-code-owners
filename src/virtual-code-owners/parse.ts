import { EOL } from "node:os";
import type { ITeamMap } from "../team-map/team-map.js";
import type {
  ISectionHeadingCSTLine,
  IUser,
  IVirtualCodeOwnerLine,
  IVirtualCodeOwnersCST,
  UserType,
} from "./cst.js";
import { isEmailIshUsername } from "../utensils.js";

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

function parseLine(
  pUntreatedLine: string,
  pTeamMap: ITeamMap,
  pLineNo: number,
): IVirtualCodeOwnerLine {
  const lTrimmedLine = pUntreatedLine.trim();
  const lCommentSplitLine = lTrimmedLine.split(/\s*#/);
  const lRule = lCommentSplitLine[0]?.match(
    /^(?<filesPattern>[^\s]+)(?<spaces>\s+)(?<userNames>.*)$/,
  );

  if (lTrimmedLine.startsWith("#!")) {
    return { type: "ignorable-comment", line: pLineNo, raw: pUntreatedLine };
  }
  if (lTrimmedLine.startsWith("#")) {
    return { type: "comment", line: pLineNo, raw: pUntreatedLine };
  }
  if (lTrimmedLine.startsWith("[") || lTrimmedLine.startsWith("^[")) {
    return parseSection(pUntreatedLine, pLineNo, pTeamMap);
  }
  if (!lRule?.groups) {
    if (lTrimmedLine === "") {
      return { type: "empty", line: pLineNo, raw: pUntreatedLine };
    }
    return { type: "unknown", line: pLineNo, raw: pUntreatedLine };
  }

  return {
    type: "rule",
    line: pLineNo,
    filesPattern: lRule.groups.filesPattern as string,
    spaces: lRule.groups.spaces as string,
    users: parseUsers(lRule.groups.userNames as string, pTeamMap),
    inlineComment: lCommentSplitLine[1] ?? "",
    raw: pUntreatedLine,
  };
}

function parseSection(
  pUntreatedLine: string,
  pLineNo: number,
  pTeamMap: ITeamMap,
): IVirtualCodeOwnerLine {
  const lTrimmedLine = pUntreatedLine.trim();
  const lCommentSplitLine = lTrimmedLine.split(/\s*#/);
  const lSection = lCommentSplitLine[0]?.match(
    /^(?<optionalIndicator>\^)?\[(?<name>[^\]]+)\](\[(?<minApprovers>[0-9]+)\])?(?<spaces>\s+)(?<userNames>.*)$/,
  );
  if (!lSection?.groups) {
    return lTrimmedLine.endsWith("]")
      ? {
          type: "section-without-users",
          line: pLineNo,
          raw: pUntreatedLine,
        }
      : {
          type: "unknown",
          line: pLineNo,
          raw: pUntreatedLine,
        };
  }
  const lReturnValue: ISectionHeadingCSTLine = {
    type: "section-heading",
    line: pLineNo,
    optional: lSection.groups.optionalIndicator === "^",
    name: lSection.groups.name as string,
    spaces: lSection.groups.spaces as string,
    users: parseUsers(lSection.groups.userNames as string, pTeamMap),
    inlineComment: lTrimmedLine.split(/\s*#/)[1] ?? "",
    raw: pUntreatedLine,
  };

  if (lSection.groups.minApprovers) {
    lReturnValue.minApprovers = parseInt(
      lSection.groups.minApprovers as string,
      10,
    );
  }

  return lReturnValue;
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
