"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doSomething = void 0;
const os_1 = require("os");
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
        // leave comments & empty lines alone
        if (lTrimmedLine.startsWith("#") || lTrimmedLine === "") {
            return pLine;
            // replace known group names with the
        }
        else {
            return replaceGroupNames(pLine, pTeamMap);
        }
    };
}
function doSomething(pCodeOwnersFileAsString, pTeamMap) {
    return pCodeOwnersFileAsString
        .split(os_1.EOL)
        .map(convertLine(pTeamMap))
        .join(os_1.EOL);
}
exports.doSomething = doSomething;
