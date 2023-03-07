import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { convert, type ITeamMap } from "./convert-virtual-code-owners.js";

export function readAndConvert(
  pVirtualCodeOwnersFileName: string,
  pVirtualTeamsFileName: string
) {
  const lVirtualCodeOwnersFileAsAString = readFileSync(
    pVirtualCodeOwnersFileName,
    {
      encoding: "utf-8",
    }
  );
  const lVirtualTeamsYamlAsAString = readFileSync(pVirtualTeamsFileName, {
    encoding: "utf-8",
  });
  const lTeamMap = yaml.load(lVirtualTeamsYamlAsAString) as ITeamMap;

  return convert(lVirtualCodeOwnersFileAsAString, lTeamMap);
}
