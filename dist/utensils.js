export function isEmailIshUsername(pUsername) {
	return (
		!pUsername.startsWith("@") &&
		!pUsername.endsWith("@") &&
		pUsername.includes("@")
	);
}
