"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = void 0;
const node_os_1 = require("node:os");
function replaceGroupNames(pLine, pTeamMap) {
    let lReturnValue = pLine;
    for (let lTeamName of Object.keys(pTeamMap)) {
        lReturnValue = lReturnValue.replace(`@${lTeamName}`, pTeamMap[lTeamName].map((pUserName) => `@${pUserName}`).join(" "));
    }
    return lReturnValue;
}
function convertLine(pTeamMap) {
    return (pLine) => {
        const lTrimmedLine = pLine.trimStart();
        if (lTrimmedLine.startsWith("#") || lTrimmedLine === "") {
            return pLine;
        }
        else {
            return replaceGroupNames(pLine, pTeamMap);
        }
    };
}
function convert(pCodeOwnersFileAsString, pTeamMap) {
    return pCodeOwnersFileAsString
        .split(node_os_1.EOL)
        .map(convertLine(pTeamMap))
        .join(node_os_1.EOL);
}
exports.convert = convert;
