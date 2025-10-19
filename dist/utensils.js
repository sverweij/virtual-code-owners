export function isEmailIshUsername(pUsername) {
	return (
		!pUsername.startsWith("@") &&
		!pUsername.endsWith("@") &&
		pUsername.includes("@")
	);
}
export function bracketsMatch(pString) {
	const lStringWithoutComment = stripComment(pString);
	let lBalanceCounter = 0;
	for (const lChar of lStringWithoutComment) {
		if (lChar === "[") {
			lBalanceCounter++;
		} else if (lChar === "]") {
			lBalanceCounter--;
		}
		if (lBalanceCounter < 0) {
			return false;
		}
	}
	return lBalanceCounter === 0;
}
function stripComment(pString) {
	const lCommentStartPosition = pString.indexOf("#");
	return lCommentStartPosition === -1
		? pString
		: pString.slice(0, lCommentStartPosition);
}
