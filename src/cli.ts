#!/usr/bin/env node
import { VERSION } from "./version.js";
import { readAndConvert } from "./read-and-convert.js";
import { writeFileSync } from "node:fs";
import { EOL } from "node:os";
import { parseArgs } from "node:util";

interface IOptions {
  virtualCodeOwners: string;
  virtualTeams: string;
  codeOwners: string;
  help: boolean;
  version: boolean;
}
let lOptions: IOptions;

try {
  let lParsedArgs = parseArgs({
    args: process.argv.slice(2),
    options: {
      virtualCodeOwners: {
        type: "string",
        short: "v",
        default: ".github/VIRTUAL-CODEOWNERS.txt",
      },
      virtualTeams: {
        type: "string",
        short: "t",
        default: ".github/virtual-teams.yml",
      },
      codeOwners: { type: "string", short: "c", default: ".github/CODEOWNERS" },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "V", default: false },
    },
    strict: true,
    // positionals allowed so lint staged can pass them on the cli. They will,
    // however, be ignored
    allowPositionals: true,
    tokens: false,
  });

  lOptions = lParsedArgs.values as IOptions;

  if (lOptions.help) {
    showHelp();
    process.exit(0);
  }
  if (lOptions.version) {
    console.log(VERSION);
    process.exit(0);
  }
} catch (pError: any) {
  console.error(`${EOL}ERROR: ${pError.message}${EOL}`);
  process.exit(1);
}

function showHelp() {
  console.log(
    `Usage: virtual-code-owners [options]

Merges a VIRTUAL-CODEOWNERS.txt and a virtual-teams.yml into CODEOWNERS

Options:
  -V, --version                        output the version number
  -v, --virtualCodeOwners [file-name]  A CODEOWNERS file with team names in them 
                                       that are defined in a virtual teams file
                                       (default: ".github/VIRTUAL-CODEOWNERS.txt")
  -t, --virtualTeams [file-name]       A YAML file listing teams and their 
                                       members
                                       (default: ".github/virtual-teams.yml")
  -c, --codeOwners [file-name]         The location of the CODEOWNERS file 
                                       (default: ".github/CODEOWNERS")
  -h, --help                           display help for command`
  );
}

try {
  const lCodeOwnersContent = readAndConvert(
    lOptions.virtualCodeOwners,
    lOptions.virtualTeams
  );
  writeFileSync(lOptions.codeOwners, lCodeOwnersContent, {
    encoding: "utf-8",
  });
  console.error(`${EOL}Wrote ${lOptions.codeOwners}${EOL}`);
} catch (pError: any) {
  console.error(`ERROR: ${pError.message}`);
  process.exitCode = 1;
}
