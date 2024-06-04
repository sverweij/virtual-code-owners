import { EOL } from "node:os";
import { isEmailIshUsername } from "../utensils.js";
let STATE = {
	currentSection: "",
	inheritedUsers: [],
};
export function parse(pVirtualCodeOwnersAsString, pTeamMap = {}) {
	STATE = {
		currentSection: "",
		inheritedUsers: [],
	};
	return pVirtualCodeOwnersAsString
		.split(EOL)
		.map((pUntreatedLine, pLineNo) =>
			parseLine(pUntreatedLine, pTeamMap, pLineNo + 1),
		);
}
function parseLine(pUntreatedLine, pTeamMap, pLineNo) {
	const lTrimmedLine = pUntreatedLine.trim();
	if (lTrimmedLine.startsWith("#!")) {
		return { type: "ignorable-comment", line: pLineNo, raw: pUntreatedLine };
	}
	if (lTrimmedLine.startsWith("#")) {
		return { type: "comment", line: pLineNo, raw: pUntreatedLine };
	}
	if (lTrimmedLine.startsWith("[") || lTrimmedLine.startsWith("^[")) {
		return parseSection(pUntreatedLine, pLineNo, pTeamMap);
	}
	if (lTrimmedLine === "") {
		return { type: "empty", line: pLineNo, raw: pUntreatedLine };
	}
	return parseRule(pUntreatedLine, pLineNo, pTeamMap);
}
function parseRule(pUntreatedLine, pLineNo, pTeamMap) {
	const lTrimmedLine = pUntreatedLine.trim();
	const lCommentSplitLine = lTrimmedLine.split(/\s*#/);
	const lRule = lCommentSplitLine[0]?.match(
		/^(?<filesPattern>[^\s]+)(?<spaces>\s+)?(?<userNames>.+)?$/,
	);
	const ruleIsValid =
		lRule?.groups &&
		(lRule.groups.userNames || STATE.inheritedUsers.length > 0);
	if (ruleIsValid) {
		let lReturnValue = {
			type: "rule",
			line: pLineNo,
			raw: pUntreatedLine,
			filesPattern: lRule.groups.filesPattern,
			spaces: lRule.groups?.spaces ?? "",
			users: parseUsers(lRule.groups?.userNames ?? "", pTeamMap),
			inlineComment: lCommentSplitLine[1] ?? "",
		};
		if (STATE.currentSection) {
			lReturnValue.inheritedUsers = STATE.inheritedUsers;
			lReturnValue.currentSection = STATE.currentSection;
		}
		return lReturnValue;
	}
	return { type: "unknown", line: pLineNo, raw: pUntreatedLine };
}
function parseSection(pUntreatedLine, pLineNo, pTeamMap) {
	const lTrimmedLine = pUntreatedLine.trim();
	const lCommentSplitLine = lTrimmedLine.split(/\s*#/);
	const lSection = lCommentSplitLine[0]?.match(
		/^(?<optionalIndicator>\^)?\[(?<name>[^\]]+)\](\[(?<minApprovers>[0-9]+)\])?(?<spaces>\s+)?(?<userNames>.+)?$/,
	);
	if (!lSection?.groups) {
		return {
			type: "unknown",
			line: pLineNo,
			raw: pUntreatedLine,
		};
	}
	const lUsers = parseUsers(lSection.groups?.userNames ?? "", pTeamMap);
	STATE = {
		currentSection: lSection.groups.name,
		inheritedUsers: lUsers,
	};
	const lReturnValue = {
		type: "section-heading",
		line: pLineNo,
		raw: pUntreatedLine,
		optional: lSection.groups.optionalIndicator === "^",
		name: lSection.groups.name,
		spaces: lSection.groups?.spaces ?? "",
		users: parseUsers(lSection.groups?.userNames ?? "", pTeamMap),
		inlineComment: lCommentSplitLine[1] ?? "",
	};
	if (lSection.groups.minApprovers) {
		lReturnValue.minApprovers = parseInt(lSection.groups.minApprovers, 10);
	}
	return lReturnValue;
}
function parseUsers(pUserNamesString, pTeamMap) {
	const lUserNames = pUserNamesString ? pUserNamesString.split(/\s+/) : [];
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
