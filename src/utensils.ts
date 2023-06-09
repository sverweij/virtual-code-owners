export function isEmailIshUsername(pUsername: string): boolean {
  const lEmailIshUsernameRE = /^.+@.+$/;
  return Boolean(pUsername.match(lEmailIshUsernameRE));
}
