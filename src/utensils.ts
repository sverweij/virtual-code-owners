export function isEmailIshUsername(pUsername: string): boolean {
  return (
    !pUsername.startsWith("@") &&
    !pUsername.endsWith("@") &&
    pUsername.includes("@")
  );
}
