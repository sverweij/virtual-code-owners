#!/usr/bin/env node

import { program } from "commander";
import { VERSION } from "./version.js";
import { readAndCovert } from "./read-and-convert.js";

program
  .description(
    "Takes a VIRTUAL-CODEOWNERS & a virtual-teams.yml and emits a CODEOWNERS to stdout"
  )
  .version(VERSION)
  .arguments("<virtual-code-owners-file> <virtual-teams.yml>")
  .parse(process.argv);

try {
  console.log(readAndCovert(program.args[0], program.args[1]));
} catch (pError: any) {
  console.error(`ERROR: ${pError.message}`);
}
