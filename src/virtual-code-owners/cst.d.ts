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
  inlineComment: string;
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
