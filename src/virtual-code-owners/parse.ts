import { EOL } from "node:os";
import type { ITeamMap } from "../team-map/team-map.js";
import type {
  IRuleCSTLine,
  ISectionHeadingCSTLine,
  IUser,
  IVirtualCodeOwnerLine,
  IVirtualCodeOwnersCST,
  UserType,
} from "./cst.js";
import { isEmailIshUsername } from "../utensils.js";

interface IInternalState {
  currentSection: string;
  inheritedUsers: IUser[];
}

let STATE: IInternalState = {
  currentSection: "",
  inheritedUsers: [],
};

export function parse(
  pVirtualCodeOwnersAsString: string,
  pTeamMap: ITeamMap = {},
): IVirtualCodeOwnersCST {
  STATE = {
    currentSection: "",
    inheritedUsers: [],
  };
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

  if (lTrimmedLine.startsWith("#!")) {
    return { type: "ignorable-comment", line: pLineNo, raw: pUntreatedLine };
  }
  if (lTrimmedLine.startsWith("#")) {
    return { type: "comment", line: pLineNo, raw: pUntreatedLine };
  }
  if (lTrimmedLine.startsWith("[") || lTrimmedLine.startsWith("^[")) {
    return parseSection(pUntreatedLine, pLineNo, pTeamMap);
  }
  if (lTrimmedLine === "") {
    return { type: "empty", line: pLineNo, raw: pUntreatedLine };
  }

  return parseRule(pUntreatedLine, pLineNo, pTeamMap);
}

function parseRule(
  pUntreatedLine: string,
  pLineNo: number,
  pTeamMap: ITeamMap,
): IVirtualCodeOwnerLine {
  const lTrimmedLine = pUntreatedLine.trim();
  const lCommentSplitLine = lTrimmedLine.split(/\s*#/);
  const lRuleWithoutUsernames = lCommentSplitLine[0]?.match(
    /^(?<filesPattern>[^\s]+)(?<spaces>\s*)$/,
  );
  const lRule = lCommentSplitLine[0]?.match(
    /^(?<filesPattern>[^\s]+)(?<spaces>\s+)(?<userNames>.+)$/,
  );

  if (lRuleWithoutUsernames?.groups && STATE.currentSection) {
    return {
      type: "rule",
      line: pLineNo,
      raw: pUntreatedLine,

      filesPattern: lRuleWithoutUsernames.groups.filesPattern as string,
      spaces: lRuleWithoutUsernames.groups.spaces as string,
      users: [],
      inheritedUsers: STATE.inheritedUsers,
      currentSection: STATE.currentSection,
      inlineComment: lCommentSplitLine[1] ?? "",
    };
  }

  if (lRule?.groups) {
    let lReturnValue: IRuleCSTLine = {
      type: "rule",
      line: pLineNo,
      raw: pUntreatedLine,

      filesPattern: lRule.groups.filesPattern as string,
      spaces: lRule.groups.spaces as string,
      users: parseUsers(lRule.groups.userNames as string, pTeamMap),
      inlineComment: lCommentSplitLine[1] ?? "",
    };
    if (STATE.currentSection) {
      lReturnValue.inheritedUsers = STATE.inheritedUsers;
      lReturnValue.currentSection = STATE.currentSection;
    }
    return lReturnValue;
  }

  return { type: "unknown", line: pLineNo, raw: pUntreatedLine };
}

function parseSection(
  pUntreatedLine: string,
  pLineNo: number,
  pTeamMap: ITeamMap,
): IVirtualCodeOwnerLine {
  const lTrimmedLine = pUntreatedLine.trim();
  const lCommentSplitLine = lTrimmedLine.split(/\s*#/);
  const lSection = lCommentSplitLine[0]?.match(
    /^(?<optionalIndicator>\^)?\[(?<name>[^\]]+)\](\[(?<minApprovers>[0-9]+)\])?(?<spaces>\s+)?(?<userNames>.+)?$/,
  );
  if (!lSection?.groups) {
    return {
      type: "unknown",
      line: pLineNo,
      raw: pUntreatedLine,
    };
  }

  const lUsers = parseUsers(lSection.groups?.userNames ?? "", pTeamMap);
  STATE = {
    currentSection: lSection.groups.name as string,
    inheritedUsers: lUsers,
  };
  const lReturnValue: ISectionHeadingCSTLine = {
    type: "section-heading",
    line: pLineNo,
    raw: pUntreatedLine,

    optional: lSection.groups.optionalIndicator === "^",
    name: lSection.groups.name as string,
    spaces: lSection.groups?.spaces ?? "",
    users: parseUsers(lSection.groups?.userNames ?? "", pTeamMap),
    inlineComment: lCommentSplitLine[1] ?? "",
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
  const lUserNames = pUserNamesString ? pUserNamesString.split(/\s+/) : [];
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
