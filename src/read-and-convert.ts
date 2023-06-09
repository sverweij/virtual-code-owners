import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { convert } from "./convert-to-codeowners.js";
import { type ITeamMap } from "./types.js";

export function readAndConvert(
  pVirtualCodeOwnersFileName: string,
  pVirtualTeamsFileName: string
) {
  const lVirtualCodeOwnersAsAString = readFileSync(pVirtualCodeOwnersFileName, {
    encoding: "utf-8",
  });
  const lVirtualTeamsAsAString = readFileSync(pVirtualTeamsFileName, {
    encoding: "utf-8",
  });
  const lTeamMap = parse(lVirtualTeamsAsAString) as ITeamMap;

  return convert(lVirtualCodeOwnersAsAString, lTeamMap);
}
