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
  `#   - run 'npx virtual-code-owners'${EOL}` +
  `#${EOL}${EOL}`;

function replaceTeamNames(pLine: string, pTeamMap: ITeamMap) {
  let lReturnValue = pLine;

  for (let lTeamName of Object.keys(pTeamMap)) {
    lReturnValue = lReturnValue.replace(
      new RegExp(`(\\s)@${lTeamName}(\\s|$)`, "g"),
      `$1${pTeamMap[lTeamName].map((pUserName) => `@${pUserName}`).join(" ")}$2`
    );
  }

  return lReturnValue;
}

function convertLine(pTeamMap: ITeamMap) {
  return (pUntreatedLine: string): string => {
    const lTrimmedLine = pUntreatedLine.trimStart();

    if (lTrimmedLine.startsWith("#") || lTrimmedLine === "") {
      // leave comments & empty lines alone
      return pUntreatedLine;
    } else {
      // replace known team names with the names from the teams
      return replaceTeamNames(pUntreatedLine, pTeamMap);
    }
  };
}

function deduplicateUserNames(pLine: string): string {
  // This is not necessary. Duplicate names work just fine. OCD is real, though.
  const lTrimmedLine = pLine.trim();
  const lSplitLine = lTrimmedLine.match(
    /^(?<filesPattern>[^\s]+)(?<theRest>.*)$/
  );

  if (lTrimmedLine.startsWith("#") || !lSplitLine?.groups) {
    return pLine;
  }

  return `${lSplitLine.groups.filesPattern} ${Array.from(
    new Set(lSplitLine.groups.theRest.trim().split(/\s+/))
  ).join(" ")}`;
}

function shouldAppearInResult(pLine: string): boolean {
  // You can mark comments that aren't relevant to appear in the result with
  // a #! token - like e.g. to write a usage message:
  //
  // #! this is not the CODEOWNERS file - to get that one run
  // #!   npx convert-code-owner
  //
  return !pLine.trimStart().startsWith("#!");
}

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
