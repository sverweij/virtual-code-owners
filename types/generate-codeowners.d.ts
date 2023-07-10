import type { ITeamMap, IVirtualCodeOwnersCST } from "./types.js";
export default function generateCodeOwners(
  pVirtualCodeOwners: IVirtualCodeOwnersCST,
  pTeamMap: ITeamMap,
  pGeneratedWarning?: string,
): string;
