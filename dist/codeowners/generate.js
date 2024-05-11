import { EOL } from "node:os";
import { isEmailIshUsername } from "../utensils.js";
const DEFAULT_WARNING =
	`#${EOL}` +
	`# DO NOT EDIT - this file is generated and your edits will be overwritten${EOL}` +
	`#${EOL}` +
	`# To make changes:${EOL}` +
	`#${EOL}` +
	`#   - edit .github/VIRTUAL-CODEOWNERS.txt${EOL}` +
	`#   - and/ or add team members to .github/virtual-teams.yml${EOL}` +
	`#   - run 'npx virtual-code-owners' (or 'npx virtual-code-owners --emitLabeler' if you also${EOL}` +
	`#     want to generate a .github/labeler.yml)${EOL}` +
	`#${EOL}${EOL}`;
export default function generateCodeOwners(
	pVirtualCodeOwners,
	pTeamMap,
	pGeneratedWarning = DEFAULT_WARNING,
) {
	return (
		pGeneratedWarning +
		pVirtualCodeOwners
			.filter((pLine) => pLine.type !== "ignorable-comment")
			.map((pLine) => generateLine(pLine, pTeamMap))
			.join(EOL)
	);
}
function generateLine(pCSTLine, pTeamMap) {
	if (pCSTLine.type === "rule") {
		const lUserNames = uniq(
			pCSTLine.users.flatMap((pUser) => expandTeamToUserNames(pUser, pTeamMap)),
		)
			.sort(compareUserNames)
			.join(" ");
		return (
			pCSTLine.filesPattern +
			pCSTLine.spaces +
			lUserNames +
			(pCSTLine.inlineComment ? ` #${pCSTLine.inlineComment}` : "")
		);
	}
	if (pCSTLine.type === "section") {
		const lUserNames = uniq(
			pCSTLine.users.flatMap((pUser) => expandTeamToUserNames(pUser, pTeamMap)),
		)
			.sort(compareUserNames)
			.join(" ");
		return (
			(pCSTLine.optional ? "^" : "") +
			"[" +
			pCSTLine.sectionName +
			"]" +
			(pCSTLine.minApprovers ? `[${pCSTLine.minApprovers}]` : "") +
			pCSTLine.spaces +
			lUserNames +
			(pCSTLine.inlineComment ? ` #${pCSTLine.inlineComment}` : "")
		);
	}
	return pCSTLine.raw;
}
function expandTeamToUserNames(pUser, pTeamMap) {
	if (pUser.type === "virtual-team-name") {
		return stringifyTeamMembers(pTeamMap, pUser.bareName);
	}
	return [pUser.raw];
}
function stringifyTeamMembers(pTeamMap, pTeamName) {
	return (pTeamMap[pTeamName] ?? []).map(userNameToCodeOwner);
}
function userNameToCodeOwner(pUserName) {
	if (isEmailIshUsername(pUserName)) {
		return pUserName;
	}
	return `@${pUserName}`;
}
function compareUserNames(pLeftName, pRightName) {
	return pLeftName.toLowerCase() > pRightName.toLowerCase() ? 1 : -1;
}
function uniq(pUserNames) {
	return Array.from(new Set(pUserNames));
}
