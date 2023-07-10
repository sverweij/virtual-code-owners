import { EOL } from "node:os";
import type {
  IInterestingCSTLine,
  ITeamMap,
  IVirtualCodeOwnersCST,
} from "types/types.js";

const DEFAULT_WARNING =
  `#${EOL}` +
  `# DO NOT EDIT - this file is generated and your edits will be overwritten${EOL}` +
  `#${EOL}` +
  `# To make changes:${EOL}` +
  `#${EOL}` +
  `#   - edit .github/VIRTUAL-CODEOWNERS.txt${EOL}` +
  `#   - and/ or add teams (& members) to .github/virtual-teams.yml${EOL}` +
  `#   - run 'npx virtual-code-owners --emitLabeler'${EOL}` +
  `#${EOL}${EOL}`;

export default function generateLabelerYml(
  pCodeOwners: IVirtualCodeOwnersCST,
  pTeamMap: ITeamMap,
  pGeneratedWarning: string = DEFAULT_WARNING,
): string {
  let lReturnValue = pGeneratedWarning;
  for (const lTeamName in pTeamMap) {
    const lPatternsForTeam = getPatternsForTeam(pCodeOwners, lTeamName)
      .map((pPattern) => `  - ${transformForYamlAndMinimatch(pPattern)}${EOL}`)
      .join("");

    if (lPatternsForTeam) {
      lReturnValue += `${lTeamName}:${EOL}${lPatternsForTeam}${EOL}`;
    }
  }
  return lReturnValue;
}

function getPatternsForTeam(
  pCodeOwners: IVirtualCodeOwnersCST,
  pTeamName: string,
): string[] {
  return (
    pCodeOwners
      .filter((pLine) => {
        const isARule = pLine.type === "rule";
        return (
          isARule &&
          lineContainsTeamName(pLine as IInterestingCSTLine, pTeamName)
        );
      })
      // @ts-expect-error ts thinks it can still be an IBoringCSTLine,
      // but with the filter above we've ruled that out
      .map((pLine: IInterestingCSTLine) => pLine.filesPattern)
  );
}

function transformForYamlAndMinimatch(pOriginalString: string): string {
  let lReturnValue = pOriginalString;

  // as documented in CODEOWNERS "*" means all files
  // similarly in minimatch "*" means all files _in the root folder only_
  // all files over there is "**" so ...
  if (pOriginalString === "*") {
    lReturnValue = "**";
  }

  // naked, unquoted "*" apparently mean something different in yaml then just
  // the string "*" (yarn parsers & validators will loudly howl if you enter
  // them naked).
  // Something similar seems to go for values _starting_ with "*"
  // Quoted they're, OK, though so that's what we'll do:
  if (lReturnValue.startsWith("*")) {
    lReturnValue = `"${lReturnValue}"`;
  }

  // in CODEOWNERS a file pattern like src/bla/ means 'everything
  // starting with "src/bla/"'. In minimatch it means 'everything
  // equal to "src/bla/"'. If you want to convey the original meaning minimatch-
  // wise you'd use "src/bla/**". So that's what we'll do.
  //
  // TODO: This does leave things like "src/bla" in the dark, though. Maybe
  // just treat these the same?
  if (pOriginalString.endsWith("/")) {
    lReturnValue = `${lReturnValue}**`;
  }

  // TODO: These transformations cover my current _known_ use cases,
  // but are these _all_ anomalies? Does a conversion lib for this exist maybe?

  return lReturnValue;
}

function lineContainsTeamName(
  pLine: IInterestingCSTLine,
  pTeamName: string,
): boolean {
  return pLine.users.some(
    (pUser) =>
      pUser.type === "virtual-team-name" && pUser.bareName === pTeamName,
  );
}
