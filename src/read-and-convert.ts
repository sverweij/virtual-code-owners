import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { convert, type ITeamMap } from "./convert-to-codeowners.js";

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
  const lTeamMap = yaml.load(lVirtualTeamsAsAString) as ITeamMap;

  return convert(lVirtualCodeOwnersAsAString, lTeamMap);
}
