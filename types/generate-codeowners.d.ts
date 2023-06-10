import type { ITeamMap, IVirtualCodeOwnersCST } from "./types.js";
export declare function generate(
  pVirtualCodeOwners: IVirtualCodeOwnersCST,
  pTeamMap: ITeamMap,
  pGeneratedWarning?: string
): string;
