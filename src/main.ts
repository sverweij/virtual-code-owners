import { writeFileSync } from "node:fs";
import { EOL } from "node:os";
import { type Writable } from "node:stream";
import generateCodeOwners from "./codeowners/generate.js";
import generateLabelerYml from "./labeler-yml/generate.js";
import readTeamMap from "./team-map/read.js";
import readVirtualCodeOwners from "./virtual-code-owners/read.js";
import type { IOptions } from "types/main.js";

export function main(pOptions: IOptions, pErrorStream: Writable) {
  const lTeamMap = readTeamMap(pOptions.virtualTeams);
  const lVirtualCodeOwners = readVirtualCodeOwners(
    pOptions.virtualCodeOwners,
    lTeamMap,
  );

  const lCodeOwnersContent = generateCodeOwners(lVirtualCodeOwners, lTeamMap);
  if (!pOptions.dryRun) {
    writeFileSync(pOptions.codeOwners, lCodeOwnersContent, {
      encoding: "utf-8",
    });
  }

  if (pOptions.emitLabeler) {
    const lLabelerContent = generateLabelerYml(lVirtualCodeOwners, lTeamMap);
    if (!pOptions.dryRun) {
      writeFileSync(pOptions.labelerLocation, lLabelerContent, {
        encoding: "utf-8",
      });
    }
    pErrorStream.write(
      `${EOL}Wrote '${pOptions.codeOwners}' AND '${pOptions.labelerLocation}'${EOL}${EOL}`,
    );
  } else {
    pErrorStream.write(`${EOL}Wrote '${pOptions.codeOwners}'${EOL}${EOL}`);
  }
}
