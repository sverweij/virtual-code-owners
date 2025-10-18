export function isEmailIshUsername(pUsername: string): boolean {
  return (
    !pUsername.startsWith("@") &&
    !pUsername.endsWith("@") &&
    pUsername.includes("@")
  );
}
export function bracketsMatch(pString: string): boolean {
  const lChars = pString.split("");
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
