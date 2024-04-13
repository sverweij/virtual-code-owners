export function getAnomalies(pVirtualCodeOwners) {
	const weirdLines = pVirtualCodeOwners
		.filter((pLine) => pLine.type === "unknown")
		.map((pLine) => ({
			...pLine,
			type: "invalid-line",
		}));
	const weirdUsers = pVirtualCodeOwners.flatMap((pLine) => {
		if (pLine.type === "rule") {
			return pLine.users
				.filter((pUser) => pUser.type === "invalid")
				.map((pUser) => ({
					...pUser,
					line: pLine.line,
					type: "invalid-user",
				}));
		}
		return [];
	});
	return weirdLines.concat(weirdUsers).sort(orderAnomaly);
}
function orderAnomaly(pLeft, pRight) {
	if (
		pLeft.line === pRight.line &&
		pLeft.type === "invalid-user" &&
		pRight.type === "invalid-user"
	) {
		return pLeft.userNumberWithinLine > pRight.userNumberWithinLine ? 1 : -1;
	} else {
		return pLeft.line > pRight.line ? 1 : -1;
	}
}
