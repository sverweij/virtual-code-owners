import { EOL } from "node:os";

export interface ITeamMap {
  [teamName: string]: string[];
}

const DEFAULT_WARNING =
  `#${EOL}` +
  `# DO NOT EDIT - this file is generated and your edits will be overwritten${EOL}` +
  `#${EOL}` +
  `# To make changes:${EOL}` +
  `#${EOL}` +
  `#   - edit .github/VIRTUAL-CODEOWNERS.txt${EOL}` +
  `#   - and/ or add team members to .github/virtual-teams.yml${EOL}` +
  `#   - run 'npx virtual-code-owners'${EOL}` +
  `#${EOL}${EOL}`;

export function convert(
  pCodeOwnersFileAsString: string,
  pTeamMap: ITeamMap,
  pGeneratedWarning: string = DEFAULT_WARNING
): string {
  return (
    pGeneratedWarning +
    pCodeOwnersFileAsString
      .split(EOL)
      .filter(shouldAppearInResult)
      .map(convertLine(pTeamMap))
      .join(EOL)
  );
}

function shouldAppearInResult(pLine: string): boolean {
  // You can mark comments that aren't relevant to appear in the result with
  // a #! token - like e.g. to write a usage message:
  //
  // #! this is not the CODEOWNERS file - to get that one run
  // #!   npx virtual-code-owners
  //
  return !pLine.trimStart().startsWith("#!");
}

function convertLine(pTeamMap: ITeamMap) {
  return (pUntreatedLine: string): string => {
    const lTrimmedLine = pUntreatedLine.trim();
    const lSplitLine = lTrimmedLine.match(
      /^(?<filesPattern>[^\s]+\s+)(?<userNames>.*)$/
    );

    if (
      lTrimmedLine.startsWith("#") ||
      lTrimmedLine === "" ||
      !lSplitLine?.groups
    ) {
      return pUntreatedLine;
    }
    const lUserNames = replaceTeamNames(lSplitLine.groups.userNames, pTeamMap);
    return lSplitLine.groups.filesPattern + uniqAndSortUserNames(lUserNames);
  };
}

function replaceTeamNames(pUserNames: string, pTeamMap: ITeamMap) {
  let lReturnValue = pUserNames;

  for (let lTeamName of Object.keys(pTeamMap)) {
    lReturnValue = lReturnValue.replace(
      new RegExp(`(\\s|^)@${lTeamName}(\\s|$)`, "g"),
      `$1${stringifyTeamMembers(pTeamMap, lTeamName)}$2`
    );
  }
  return lReturnValue;
}

function stringifyTeamMembers(pTeamMap: ITeamMap, pTeamName: string): string {
  return pTeamMap[pTeamName].map((pUserName) => `@${pUserName}`).join(" ");
}

function uniqAndSortUserNames(pUserNames: string): string {
  return Array.from(new Set(pUserNames.split(/\s+/)))
    .sort()
    .join(" ");
}
