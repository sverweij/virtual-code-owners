import { isEmailIshUsername } from "./utensils.js";
import { EOL } from "node:os";
export function parse(pVirtualCodeOwnersAsString, pTeamMap = {}) {
    return pVirtualCodeOwnersAsString
        .split(EOL)
        .map((pUntreatedLine, pLineNo) => parseLine(pUntreatedLine, pTeamMap, pLineNo + 1));
}
function parseLine(pUntreatedLine, pTeamMap, pLineNo) {
    const lTrimmedLine = pUntreatedLine.trim();
    const lSplitLine = lTrimmedLine.match(/^(?<filesPattern>[^\s]+)(?<spaces>\s+)(?<userNames>.*)$/);
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
function parseUsers(pUserNamesString, pTeamMap) {
    const lUserNames = pUserNamesString.split(/\s+/);
    return lUserNames.map((pUserName) => {
        return {
            type: getUserNameType(pUserName, pTeamMap),
            bareName: getBareUserName(pUserName),
            raw: pUserName,
        };
    });
}
function getUserNameType(pUserName, pTeamMap) {
    if (isEmailIshUsername(pUserName)) {
        return "e-mail-address";
    }
    if (pUserName.startsWith("@")) {
        if (pTeamMap.hasOwnProperty(getBareUserName(pUserName))) {
            return "virtual-team-name";
        }
        return "other-user-or-team";
    }
    return "invalid";
}
function getBareUserName(pUserName) {
    if (pUserName.startsWith("@")) {
        return pUserName.slice(1);
    }
    return pUserName;
}
