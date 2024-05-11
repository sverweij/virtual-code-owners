export type IVirtualCodeOwnersCST = IVirtualCodeOwnerLine[];
export type IVirtualCodeOwnerLine = IBoringCSTLine | IInterestingCSTLine;
export type IInterestingCSTLine = IRuleCSTLine | ISectionHeadingCSTLine;
export interface IBoringCSTLine {
  type:
    | "comment"
    | "ignorable-comment"
    | "empty"
    | "section-without-users"
    | "unknown";
  line: number;
  raw: string;
}
export interface IRuleCSTLine {
  type: "rule";
  line: number;
  filesPattern: string;
  spaces: string;
  users: IUser[];
  inlineComment: string;
  raw: string;
}
export interface ISectionHeadingCSTLine {
  type: "section-heading";
  line: number;
  optional: boolean;
  sectionName: string;
  minApprovers?: number;
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
