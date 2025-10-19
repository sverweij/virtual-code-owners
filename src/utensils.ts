export function isEmailIshUsername(pUsername: string): boolean {
  return (
    !pUsername.startsWith("@") &&
    !pUsername.endsWith("@") &&
    pUsername.includes("@")
  );
}

/**
 * Checks if the brackets in the non-comment part of a given string
 * are balanced.
 *
 * @param pString - The string to check for balanced brackets.
 * @returns true if the brackets in the non-comment part of the string
 *         are balanced, false otherwise.
 */
export function bracketsMatch(pString: string): boolean {
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

function exfiltrateNonComment(pString: string): string {
  // @ts-expect-error TS2322 - split  _always_ returns an array with
  // at least one element, so the error is incorrect.
  return pString.split("#")[0];
}
