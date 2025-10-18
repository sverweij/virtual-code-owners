export function isEmailIshUsername(pUsername) {
	return (
		!pUsername.startsWith("@") &&
		!pUsername.endsWith("@") &&
		pUsername.includes("@")
	);
}
export function bracketsMatch(pString) {
	const lStringWithoutComment = exfiltrateNonComment(pString);
	const lChars = lStringWithoutComment.split("");
	let lBalanceCounter = 0;
	for (let i = 0; i < lChars.length; i++) {
		if (lChars[i] === "[") {
			lBalanceCounter++;
		} else if (lChars[i] === "]") {
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
