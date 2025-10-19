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

function stripComment(pString: string): string {
  const lCommentStartPosition = pString.indexOf("#");
  return lCommentStartPosition === -1
    ? pString
    : pString.slice(0, lCommentStartPosition);
}
