import type { IAnomaly, ITeamMap, IVirtualCodeOwnersCST } from "./types.js";
/**
 * parses (virtual) codeowners as a string into a virtual codeowners CST
 * which can be used to do further  rocessing on (e.g. generate codeowners,
 * validate etc.)
 *
 * @param pVirtualCodeOwnersAsString CODEOWNERS or VIRTUAL-CODE-OWNERS.txt file  to parse
 * @param pTeamMap a virtual team map  ()
 * @returns a virtual code owners CST
 */
export declare function parse(
  pVirtualCodeOwnersAsString: string,
  pTeamMap?: ITeamMap,
): IVirtualCodeOwnersCST;

export declare function getAnomalies(
  pVirtualCodeOwners: IVirtualCodeOwnersCST,
): IAnomaly[];
