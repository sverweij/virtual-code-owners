import { EOL } from "node:os";
function replaceTeamNames(pLine, pTeamMap) {
    let lReturnValue = pLine;
    for (let lTeamName of Object.keys(pTeamMap)) {
        lReturnValue = lReturnValue.replace(`@${lTeamName}`, pTeamMap[lTeamName].map((pUserName) => `@${pUserName}`).join(" "));
    }
    return lReturnValue;
}
function convertLine(pTeamMap) {
    return (pUntreatedLine) => {
        const lTrimmedLine = pUntreatedLine.trimStart();
        if (lTrimmedLine.startsWith("#") || lTrimmedLine === "") {
            return pUntreatedLine;
        }
        else {
            return replaceTeamNames(pUntreatedLine, pTeamMap);
        }
    };
}
export function convert(pCodeOwnersFileAsString, pTeamMap) {
    return pCodeOwnersFileAsString
        .split(EOL)
        .map(convertLine(pTeamMap))
        .join(EOL);
}
