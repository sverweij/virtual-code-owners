export type IVirtualCodeOwnersCST = IVirtualCodeOwnerLine[];
export type IVirtualCodeOwnerLine = IBoringCSTLine | IInterestingCSTLine;
export type IInterestingCSTLine = IRuleCSTLine | ISectionHeadingCSTLine;
export interface IBoringCSTLine {
  type: "comment" | "ignorable-comment" | "empty" | "unknown";
  line: number;
  raw: string;
}
export interface IRuleCSTLine {
  type: "rule";
  line: number;
  raw: string;

  filesPattern: string;
  spaces: string;
  users: IUser[];
  currentSection?: string;
  inheritedUsers?: IUser[];
  inlineComment: string;
}
export interface ISectionHeadingCSTLine {
  type: "section-heading";
  line: number;
  raw: string;

  optional: boolean;
  name: string;
  minApprovers?: number;
  spaces: string;
  users: IUser[];
  inlineComment: string;
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
