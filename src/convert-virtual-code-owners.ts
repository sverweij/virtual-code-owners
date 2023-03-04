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
  `#   - edit VIRTUAL-CODEOWNERS.txt${EOL}` +
  `#   - run 'npx virtual-code-owners VIRTUAL-CODE-OWNERS.txt virtual-teams.yml > CODEOWNERS'${EOL}` +
  `#${EOL}${EOL}`;

function replaceTeamNames(pLine: string, pTeamMap: ITeamMap) {
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

function isNotIgnorable(pLine: string): boolean {
  // You can mark comments that aren't relevant to appear in the result with
  // a #! token.
  //
  // #! this is not the CODEOWNERS file - to get that one run
  // #!   npx convert-code-owner  thisfile.txt virtual-teams.yml > CODEOWNERS
  // #! on this.
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
    .filter(isNotIgnorable)
    .map(convertLine(pTeamMap))
    .join(EOL)}`;
}
