export function isEmailIshUsername(pUsername) {
	const lEmailIshUsernameRE = /^.+@.+$/;
	return Boolean(pUsername.match(lEmailIshUsernameRE));
}
