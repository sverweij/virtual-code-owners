import { EOL } from "node:os";

export interface ITeamMap {
  [teamName: string]: string[];
}

const DEFAULT_GENERATED_WARNING =
  `#${EOL}` +
  `# DO NOT EDIT - this file is generated and your edits will be overwritten${EOL}` +
  `#${EOL}` +
  `# To make changes:${EOL}` +
  `#${EOL}` +
  `#   - edit .github/VIRTUAL-CODEOWNERS.txt${EOL}` +
  `#   - and/ or add team members to .github/virtual-teams.yml${EOL}` +
  `#   - run 'npx virtual-code-owners'${EOL}` +
  `#${EOL}${EOL}`;
const LINE_PATTERN = /^(?<filesPattern>[^\s]+\s+)(?<userNames>.*)$/;

export function convert(
  pCodeOwnersFileAsString: string,
  pTeamMap: ITeamMap,
  pGeneratedWarning: string = DEFAULT_GENERATED_WARNING
): string {
  return `${pGeneratedWarning}${pCodeOwnersFileAsString
    .split(EOL)
    .filter(shouldAppearInResult)
    .map(convertLine(pTeamMap))
    .map(deduplicateUserNames)
    .join(EOL)}`;
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

    if (lTrimmedLine.startsWith("#") || lTrimmedLine === "") {
      // leave comments & empty lines alone
      return pUntreatedLine;
    } else {
      // replace known team names with the names from the teams
      return replaceTeamNames(lTrimmedLine, pTeamMap);
    }
  };
}

function replaceTeamNames(pTrimmedLine: string, pTeamMap: ITeamMap) {
  const lSplitLine = pTrimmedLine.match(LINE_PATTERN);

  if (!lSplitLine?.groups) {
    return pTrimmedLine;
  }

  let lUserNames = lSplitLine.groups.userNames.trim();

  for (let lTeamName of Object.keys(pTeamMap)) {
    lUserNames = lUserNames.replace(
      new RegExp(`(\\s|^)@${lTeamName}(\\s|$)`, "g"),
      `$1${stringifyTeamMembers(pTeamMap, lTeamName)}$2`
    );
  }
  return `${lSplitLine.groups.filesPattern}${lUserNames}`;
}

function stringifyTeamMembers(pTeamMap: ITeamMap, pTeamName: string): string {
  return pTeamMap[pTeamName].map((pUserName) => `@${pUserName}`).join(" ");
}

function deduplicateUserNames(pTrimmedLine: string): string {
  // De-duplicating usernames is not necessary. Duplicate names work just fine.
  // OCD is real, though.
  const lSplitLine = pTrimmedLine.match(LINE_PATTERN);

  if (pTrimmedLine.startsWith("#") || !lSplitLine?.groups) {
    return pTrimmedLine;
  }

  return `${lSplitLine.groups.filesPattern}${Array.from(
    new Set(lSplitLine.groups.userNames.trim().split(/\s+/))
  )
    .sort()
    .join(" ")}`;
}
