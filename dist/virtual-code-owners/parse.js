import { EOL } from "node:os";
import { isEmailIshUsername } from "../utensils.js";
export function parse(pVirtualCodeOwnersAsString, pTeamMap = {}) {
	return pVirtualCodeOwnersAsString
		.split(EOL)
		.map((pUntreatedLine, pLineNo) =>
			parseLine(pUntreatedLine, pTeamMap, pLineNo + 1),
		);
}
function parseLine(pUntreatedLine, pTeamMap, pLineNo) {
	const lTrimmedLine = pUntreatedLine.trim();
	const lCommentSplitLine = lTrimmedLine.split(/\s*#/);
	const lRule = lCommentSplitLine[0]?.match(
		/^(?<filesPattern>[^\s]+)(?<spaces>\s+)(?<userNames>.*)$/,
	);
	if (lTrimmedLine.startsWith("#!")) {
		return { type: "ignorable-comment", line: pLineNo, raw: pUntreatedLine };
	}
	if (lTrimmedLine.startsWith("#")) {
		return { type: "comment", line: pLineNo, raw: pUntreatedLine };
	}
	if (lTrimmedLine.startsWith("[") || lTrimmedLine.startsWith("^[")) {
		return parseSection(pUntreatedLine, pLineNo, pTeamMap);
	}
	if (!lRule?.groups) {
		if (lTrimmedLine === "") {
			return { type: "empty", line: pLineNo, raw: pUntreatedLine };
		}
		return { type: "unknown", line: pLineNo, raw: pUntreatedLine };
	}
	return {
		type: "rule",
		line: pLineNo,
		filesPattern: lRule.groups.filesPattern,
		spaces: lRule.groups.spaces,
		users: parseUsers(lRule.groups.userNames, pTeamMap),
		inlineComment: lCommentSplitLine[1] ?? "",
		raw: pUntreatedLine,
	};
}
function parseSection(pUntreatedLine, pLineNo, pTeamMap) {
	const lTrimmedLine = pUntreatedLine.trim();
	const lCommentSplitLine = lTrimmedLine.split(/\s*#/);
	const lSection = lCommentSplitLine[0]?.match(
		/^(?<optionalIndicator>\^)?\[(?<name>[^\]]+)\](\[(?<minApprovers>[0-9]+)\])?(?<spaces>\s+)(?<userNames>.*)$/,
	);
	if (!lSection?.groups) {
		return lTrimmedLine.endsWith("]")
			? {
					type: "section-without-users",
					line: pLineNo,
					raw: pUntreatedLine,
				}
			: {
					type: "unknown",
					line: pLineNo,
					raw: pUntreatedLine,
				};
	}
	const lReturnValue = {
		type: "section-heading",
		line: pLineNo,
		optional: lSection.groups.optionalIndicator === "^",
		name: lSection.groups.name,
		spaces: lSection.groups.spaces,
		users: parseUsers(lSection.groups.userNames, pTeamMap),
		inlineComment: lTrimmedLine.split(/\s*#/)[1] ?? "",
		raw: pUntreatedLine,
	};
	if (lSection.groups.minApprovers) {
		lReturnValue.minApprovers = parseInt(lSection.groups.minApprovers, 10);
	}
	return lReturnValue;
}
function parseUsers(pUserNamesString, pTeamMap) {
	const lUserNames = pUserNamesString.split(/\s+/);
	return lUserNames.map((pUserName, pIndex) => {
		const lBareName = getBareUserName(pUserName);
		return {
			type: getUserNameType(pUserName, lBareName, pTeamMap),
			userNumberWithinLine: pIndex + 1,
			bareName: lBareName,
			raw: pUserName,
		};
	});
}
function getUserNameType(pUserName, pBareName, pTeamMap) {
	if (isEmailIshUsername(pUserName)) {
		return "e-mail-address";
	}
	if (pUserName.startsWith("@")) {
		if (pTeamMap.hasOwnProperty(pBareName)) {
			return "virtual-team-name";
		}
		return "other-user-or-team";
	}
	return "invalid";
}
function getBareUserName(pUserName) {
	if (pUserName.startsWith("@")) {
		return pUserName.slice(1);
	}
	return pUserName;
}
