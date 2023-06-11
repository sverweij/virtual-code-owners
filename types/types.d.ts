export interface ITeamMap {
  [teamName: string]: string[];
}

export type IVirtualCodeOwnersCST = IVirtualCodeOwnerLine[];
export type IVirtualCodeOwnerLine = IBoringCSTLine | IInterestingCSTLine;
export interface IBoringCSTLine {
  type: "comment" | "ignorable-comment" | "empty" | "unknown";
  line: number;
  raw: string;
}
export interface IInterestingCSTLine {
  type: "rule";
  line: number;
  filesPattern: string;
  spaces: string;
  users: IUser[];
  raw: string;
}
export type UserType =
  | "virtual-team-name"
  | "e-mail-address"
  | "other-user-or-team"
  | "invalid";
export type IUser = {
  type: UserType;
  userNumberWithinLine: number;
  bareName: string;
  raw: string;
};

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
