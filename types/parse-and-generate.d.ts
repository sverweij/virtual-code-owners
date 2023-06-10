/**
 *
 * @param pVirtualCodeOwnersFileName full path to your VIRTUAL-CODEOWNERS.txt
 * @param pVirtualTeamsFileName full path to your virtual-teams.yml
 * @returns a string you can write to a CODEOWNERS file
 */
export default function parseAndGenerate(
  pVirtualCodeOwnersFileName: string,
  pVirtualTeamsFileName: string
): string;
