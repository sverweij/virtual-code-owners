import { readFileSync } from "node:fs";
import { EOL } from "node:os";
import type { ITeamMap } from "../team-map/team-map.js";
import { getAnomalies, type IAnomaly } from "./anomalies.js";
import type { IVirtualCodeOwnersCST } from "./cst.js";
import { parse as parseVirtualCodeOwners } from "./parse.js";

export default function readVirtualCodeOwners(
  pVirtualCodeOwnersFileName: string,
  pTeamMap: ITeamMap,
): IVirtualCodeOwnersCST {
  const lVirtualCodeOwnersAsAString = readFileSync(pVirtualCodeOwnersFileName, {
    encoding: "utf-8",
    flag: "r",
  });
  const lVirtualCodeOwners = parseVirtualCodeOwners(
    lVirtualCodeOwnersAsAString,
    pTeamMap,
  );
  const lAnomalies = getAnomalies(lVirtualCodeOwners);
  if (lAnomalies.length > 0) {
    throw new Error(
      `This is not a valid virtual code-owners file:${EOL}${reportAnomalies(
        pVirtualCodeOwnersFileName,
        lAnomalies,
      )}`,
    );
  }
  return lVirtualCodeOwners;
}

function reportAnomalies(pFileName: string, pAnomalies: IAnomaly[]): string {
  return pAnomalies
    .map((pAnomaly) =>
      pAnomaly.type === "invalid-line"
        ? `${pFileName}:${pAnomaly.line}:1 invalid line - neither a rule, section heading, comment nor empty: "${pAnomaly.raw}"`
        : `${pFileName}:${pAnomaly.line}:1 invalid user or team name "${pAnomaly.raw}" (#${pAnomaly.userNumberWithinLine} on this line). ` +
          `It should either start with "@" or be an e-mail address.`,
    )
    .join(EOL);
}
