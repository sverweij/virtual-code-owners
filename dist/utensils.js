export function isEmailIshUsername(pUsername) {
	return (
		!pUsername.startsWith("@") &&
		!pUsername.endsWith("@") &&
		pUsername.includes("@")
	);
}
export function bracketsMatch(pString) {
	const lStringWithoutComment = exfiltrateNonComment(pString);
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
function exfiltrateNonComment(pString) {
	return pString.split(/\s*#/)[0];
}
