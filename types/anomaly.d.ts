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
