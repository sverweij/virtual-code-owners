import { EOL } from "node:os";
import type {
  IInterestingCSTLine,
  ITeamMap,
  IVirtualCodeOwnersCST,
} from "types/types.js";

export function generate(
  pCodeOwners: IVirtualCodeOwnersCST,
  pTeamMap: ITeamMap
): string {
  let lReturnValue = "";
  for (const lTeamName in pTeamMap) {
    const lPatternsForTeam = getPatternsForTeam(pCodeOwners, lTeamName)
      .map((pPattern) => `- ${yamlEscape(pPattern)}${EOL}`)
      .join("");

    if (lPatternsForTeam) {
      lReturnValue += `${lTeamName}:${EOL}${lPatternsForTeam}${EOL}`;
    }
  }
  return lReturnValue;
}

function getPatternsForTeam(
  pCodeOwners: IVirtualCodeOwnersCST,
  pTeamName: string
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

function yamlEscape(pUnescapedString: string): string {
  let lReturnValue = pUnescapedString;
  if (pUnescapedString === "*") {
    lReturnValue = "**";
  }
  if (lReturnValue.startsWith("*")) {
    lReturnValue = `'${lReturnValue}'`;
  }
  if (pUnescapedString.endsWith("/")) {
    lReturnValue = `${lReturnValue}**`;
  }
  return lReturnValue;
}

function lineContainsTeamName(
  pLine: IInterestingCSTLine,
  pTeamName: string
): boolean {
  return pLine.users.some(
    (pUser) =>
      pUser.type === "virtual-team-name" && pUser.bareName === pTeamName
  );
}
