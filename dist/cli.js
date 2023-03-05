#!/usr/bin/env node
import { program } from "commander";
import { VERSION } from "./version.js";
import { readAndConvert } from "./read-and-convert.js";
import { writeFileSync } from "node:fs";
import { EOL } from "node:os";
program
    .description("Merges a VIRTUAL-CODEOWNERS.txt and a virtual-teams.yml into CODEOWNERS")
    .version(VERSION)
    .option("-v, --virtual-code-owners [file-name]", "A CODEOWNERS file with team names in them that are defined in a virtual teams file", ".github/VIRTUAL-CODEOWNERS.txt")
    .option("-t, --virtual-teams [file-name]", "A YAML file listing teams and their members", ".github/virtual-teams.yml")
    .option("-c, --code-owners [file-name]", "The location of the CODEOWNERS file", ".github/CODEOWNERS")
    .parse(process.argv);
try {
    const lCodeOwnersContent = readAndConvert(program.opts().virtualCodeOwners, program.opts().virtualTeams);
    writeFileSync(program.opts().codeOwners, lCodeOwnersContent, {
        encoding: "utf-8",
    });
    console.error(`${EOL}Wrote ${program.opts().codeOwners}${EOL}`);
}
catch (pError) {
    console.error(`ERROR: ${pError.message}`);
    process.exitCode = 1;
}
