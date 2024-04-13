import { writeFileSync } from "node:fs";
import { EOL } from "node:os";
import generateCodeOwners from "./codeowners/generate.js";
import generateLabelerYml from "./labeler-yml/generate.js";
import readTeamMap from "./team-map/read.js";
import readVirtualCodeOwners from "./virtual-code-owners/read.js";
export function main(pOptions, pErrorStream) {
	const lTeamMap = readTeamMap(pOptions.virtualTeams);
	const lVirtualCodeOwners = readVirtualCodeOwners(
		pOptions.virtualCodeOwners,
		lTeamMap,
	);
	const lCodeOwnersContent = generateCodeOwners(lVirtualCodeOwners, lTeamMap);
	if (!pOptions.dryRun) {
		writeFileSync(pOptions.codeOwners, lCodeOwnersContent, {
			encoding: "utf-8",
			flag: "w",
		});
	}
	if (pOptions.emitLabeler) {
		const lLabelerContent = generateLabelerYml(lVirtualCodeOwners, lTeamMap);
		if (!pOptions.dryRun) {
			writeFileSync(pOptions.labelerLocation, lLabelerContent, {
				encoding: "utf-8",
				flag: "w",
			});
		}
		pErrorStream.write(
			`${EOL}Wrote '${pOptions.codeOwners}' AND '${pOptions.labelerLocation}'${EOL}${EOL}`,
		);
	} else {
		pErrorStream.write(`${EOL}Wrote '${pOptions.codeOwners}'${EOL}${EOL}`);
	}
}
