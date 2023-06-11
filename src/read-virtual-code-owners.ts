import { readFileSync } from "node:fs";
import type { ITeamMap, IVirtualCodeOwnersCST } from "types/types.js";
import { parse as parseVirtualCodeOwners } from "./parse.js";

export default function readVirtualCodeOwners(
  pVirtualCodeOwnersFileName: string,
  pTeamMap: ITeamMap
): IVirtualCodeOwnersCST {
  const lVirtualCodeOwnersAsAString = readFileSync(pVirtualCodeOwnersFileName, {
    encoding: "utf-8",
  });
  return parseVirtualCodeOwners(lVirtualCodeOwnersAsAString, pTeamMap);
}
