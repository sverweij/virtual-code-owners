import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { EOL } from "node:os";
export default function readTeamMap(pVirtualTeamsFileName) {
	const lVirtualTeamsAsAString = readFileSync(pVirtualTeamsFileName, {
		encoding: "utf-8",
	});
	const lTeamMap = parseYaml(lVirtualTeamsAsAString);
	assertTeamMapValid(lTeamMap, pVirtualTeamsFileName);
	return lTeamMap;
}
function assertTeamMapValid(pTeamMapCandidate, pVirtualTeamsFileName) {
	const [lValid, lError] = validateTeamMap(pTeamMapCandidate);
	if (!lValid) {
		throw new Error(
			`'${pVirtualTeamsFileName}' is not a valid virtual-teams.yml:${EOL}  ${lError}`,
		);
	}
}
function validateTeamMap(pCandidateTeamMap) {
	if (
		typeof pCandidateTeamMap !== "object" ||
		pCandidateTeamMap === null ||
		Array.isArray(pCandidateTeamMap)
	) {
		return [false, "The team map is not an object"];
	}
	const lTeamNameResults = Object.keys(pCandidateTeamMap).map(validateTeamName);
	const lErrors = lTeamNameResults.filter((result) => !result[0]);
	if (lErrors.length > 0) {
		return [
			false,
			`These team names are not valid: ${lErrors.map((error) => error[1]).join(", ")}`,
		];
	}
	const lTeamResults = Object.keys(pCandidateTeamMap).map((pKey) =>
		validateTeam(pCandidateTeamMap[pKey], pKey),
	);
	const lTeamErrors = lTeamResults.filter((result) => !result[0]);
	if (lTeamErrors.length > 0) {
		return [false, lTeamErrors.map((error) => error[1]).join(`, ${EOL}  `)];
	}
	return [true];
}
function validateTeamName(pTeamNameCandidate) {
	if (typeof pTeamNameCandidate !== "string") {
		return [false, "not a string"];
	}
	if (pTeamNameCandidate === "") {
		return [false, "'' (empty string)"];
	}
	if (pTeamNameCandidate.includes(" ")) {
		return [false, `'${pTeamNameCandidate}' (contains spaces)`];
	}
	return [true];
}
function validateTeam(pCandidateTeam, pTeamName) {
	if (!Array.isArray(pCandidateTeam)) {
		return [false, `This team is not an array: '${pTeamName}'`];
	}
	const lTeamMemberResults = pCandidateTeam.map(validateTeamMember);
	const lErrors = lTeamMemberResults.filter((result) => !result[0]);
	if (lErrors.length > 0) {
		return [false, lErrors.map((error) => error[1]).join(", ")];
	}
	return [true];
}
function validateTeamMember(pTeamMemberCandidate) {
	if (typeof pTeamMemberCandidate !== "string") {
		return [
			false,
			`This username is not a string: '${pTeamMemberCandidate.toString()}'`,
		];
	}
	if (!/^[^@][^\s]+$/.test(pTeamMemberCandidate)) {
		return [
			false,
			`This username doesn't match /^[^@][^\\s]+$/: '${pTeamMemberCandidate}'`,
		];
	}
	return [true];
}
