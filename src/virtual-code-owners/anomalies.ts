import type { IVirtualCodeOwnersCST } from "./cst.js";

export type IAnomaly = ILineAnomaly | IUserAnomaly;
export interface ILineAnomaly {
  type: "invalid-line";
  line: number;
  raw: string;
}
export interface IUserAnomaly {
  type: "invalid-user";
  line: number;
  userNumberWithinLine: number;
  bareName: string;
  raw: string;
}

export function getAnomalies(
  pVirtualCodeOwners: IVirtualCodeOwnersCST,
): IAnomaly[] {
  const weirdLines = pVirtualCodeOwners
    .filter((pLine) => pLine.type === "unknown")
    .map((pLine) => ({
      ...pLine,
      type: "invalid-line",
    })) as ILineAnomaly[];
  const weirdUsers = pVirtualCodeOwners.flatMap((pLine) => {
    if (pLine.type === "rule") {
      return pLine.users
        .filter((pUser) => pUser.type === "invalid")
        .map((pUser) => ({
          ...pUser,
          line: pLine.line,
          type: "invalid-user",
        }));
    }
    return [];
  }) as IUserAnomaly[];
  return (weirdLines as IAnomaly[]).concat(weirdUsers).sort(orderAnomaly);
}
function orderAnomaly(pLeft: IAnomaly, pRight: IAnomaly): number {
  if (
    pLeft.line === pRight.line &&
    pLeft.type === "invalid-user" &&
    pRight.type === "invalid-user"
  ) {
    return pLeft.userNumberWithinLine > pRight.userNumberWithinLine ? 1 : -1;
  } else {
    return pLeft.line > pRight.line ? 1 : -1;
  }
}
