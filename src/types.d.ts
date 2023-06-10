export interface ITeamMap {
  [teamName: string]: string[];
}

export type ICST = ICSTLine[];
export type ICSTLine = IBoringCSTLine | IInterestingCSTLine;
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
  | "other-user-or-team";
export type IUser = {
  type: UserType;
  raw: string;
};
