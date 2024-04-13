import Ajv from "ajv";
import { readFileSync } from "node:fs";
import { EOL } from "node:os";
import { parse as parseYaml } from "yaml";
import virtualTeamsSchema from "./virtual-teams.schema.js";
export default function readTeamMap(pVirtualTeamsFileName) {
	const lVirtualTeamsAsAString = readFileSync(pVirtualTeamsFileName, {
		encoding: "utf-8",
	});
	const lTeamMap = parseYaml(lVirtualTeamsAsAString);
	assertTeamMapValid(lTeamMap, pVirtualTeamsFileName);
	return lTeamMap;
}
function assertTeamMapValid(pTeamMap, pVirtualTeamsFileName) {
	const ajv = new Ajv({
		allErrors: true,
		verbose: true,
	});
	if (!ajv.validate(virtualTeamsSchema, pTeamMap)) {
		throw new Error(
			`This is not a valid virtual-teams.yml:${EOL}${formatAjvErrors(ajv.errors, pVirtualTeamsFileName)}.\n`,
		);
	}
}
function formatAjvErrors(pAjvErrors, pVirtualTeamsFileName) {
	return pAjvErrors
		.map((pAjvError) => formatAjvError(pAjvError, pVirtualTeamsFileName))
		.join(EOL);
}
function formatAjvError(pAjvError, pVirtualTeamsFileName) {
	return `${pVirtualTeamsFileName}: ${pAjvError.instancePath} - ${JSON.stringify(pAjvError.data)} ${pAjvError.message}`;
}
