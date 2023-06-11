import { EOL } from "node:os";
import { isEmailIshUsername } from "./utensils.js";
export function parse(pVirtualCodeOwnersAsString, pTeamMap = {}) {
    return pVirtualCodeOwnersAsString
        .split(EOL)
        .map((pUntreatedLine, pLineNo) => parseLine(pUntreatedLine, pTeamMap, pLineNo + 1));
}
export function getAnomalies(pVirtualCodeOwners) {
    const weirdLines = pVirtualCodeOwners
        .filter((pLine) => pLine.type === "unknown")
        .map((pLine) => ({
        ...pLine,
        type: "invalid-line",
    }));
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
    });
    return weirdLines.concat(weirdUsers).sort(orderAnomaly);
}
function orderAnomaly(pLeft, pRight) {
    return pLeft.line > pRight.line ? 1 : -1;
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
function getUserNameType(pUserName, pBareName, pTeamMap) {
    if (isEmailIshUsername(pUserName)) {
        return "e-mail-address";
    }
    if (pUserName.startsWith("@")) {
        if (pTeamMap.hasOwnProperty(pBareName)) {
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
