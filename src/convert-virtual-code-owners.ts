import { EOL } from "node:os";

export interface ITeamMap {
  [teamName: string]: string[];
}

function replaceGroupNames(pLine: string, pTeamMap: ITeamMap) {
  let lReturnValue = pLine;

  for (let lTeamName of Object.keys(pTeamMap)) {
    lReturnValue = lReturnValue.replace(
      `@${lTeamName}`,
      pTeamMap[lTeamName].map((pUserName) => `@${pUserName}`).join(" ")
    );
  }

  return lReturnValue;
}

function convertLine(pTeamMap: ITeamMap) {
  return (pLine: string): string => {
    const lTrimmedLine = pLine.trimStart();

    // leave comments & empty lines alone
    if (lTrimmedLine.startsWith("#") || lTrimmedLine === "") {
      return pLine;
      // replace known group names with the names from the teams
    } else {
      return replaceGroupNames(pLine, pTeamMap);
    }
  };
}

export function convert(
  pCodeOwnersFileAsString: string,
  pTeamMap: ITeamMap
): string {
  return pCodeOwnersFileAsString
    .split(EOL)
    .map(convertLine(pTeamMap))
    .join(EOL);
}
