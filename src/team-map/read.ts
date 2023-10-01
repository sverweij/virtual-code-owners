import Ajv from "ajv";
import { readFileSync } from "node:fs";
import { EOL } from "node:os";
import type { ITeamMap } from "types/team-map.js";
import { parse as parseYaml } from "yaml";

const TEAM_MAP_SCHEMA = JSON.parse(
  readFileSync(
    new URL("../virtual-teams.schema.json", import.meta.url),
    "utf-8",
  ),
);

export default function readTeamMap(pVirtualTeamsFileName: string): ITeamMap {
  const lVirtualTeamsAsAString = readFileSync(pVirtualTeamsFileName, {
    encoding: "utf-8",
  });
  const lTeamMap = parseYaml(lVirtualTeamsAsAString) as ITeamMap;
  assertTeamMapValid(lTeamMap, pVirtualTeamsFileName);

  return lTeamMap;
}

function assertTeamMapValid(pTeamMap: ITeamMap, pVirtualTeamsFileName: string) {
  //@ts-expect-error typescript can't find a constructor in the type declaration.
  // This _works_, though and is the canonical way to work with ajv
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
  });

  if (!ajv.validate(TEAM_MAP_SCHEMA, pTeamMap)) {
    throw new Error(
      `This is not a valid virtual-teams.yml:${EOL}${formatAjvErrors(
        ajv.errors,
        pVirtualTeamsFileName,
      )}.\n`,
    );
  }
}

function formatAjvErrors(
  pAjvErrors: any[],
  pVirtualTeamsFileName: string,
): string {
  return pAjvErrors
    .map((pAjvError) => formatAjvError(pAjvError, pVirtualTeamsFileName))
    .join(EOL);
}

function formatAjvError(pAjvError: any, pVirtualTeamsFileName: string): string {
  return `${pVirtualTeamsFileName}: ${
    pAjvError.instancePath
  } - ${JSON.stringify(pAjvError.data)} ${pAjvError.message}`;
}
