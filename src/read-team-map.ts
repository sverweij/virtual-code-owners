import { readFileSync } from "node:fs";
import type { ITeamMap } from "types/types.js";
import { parse as parseYaml } from "yaml";

export default function readTeamMap(pVirtualTeamsFileName: string): ITeamMap {
  const lVirtualTeamsAsAString = readFileSync(pVirtualTeamsFileName, {
    encoding: "utf-8",
  });
  return parseYaml(lVirtualTeamsAsAString) as ITeamMap;
}
