#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const version_js_1 = require("./version.js");
const read_and_convert_js_1 = require("./read-and-convert.js");
commander_1.program
    .description("Takes a VIRTUAL-CODEOWNERS & a virtual-teams.yml and emits a CODEOWNERS to stdout")
    .version(version_js_1.VERSION)
    .arguments("<virtual-code-owners-file> <virtual-teams.yml>")
    .parse(process.argv);
try {
    console.log((0, read_and_convert_js_1.readAndCovert)(commander_1.program.args[0], commander_1.program.args[1]));
}
catch (pError) {
    console.error(`ERROR: ${pError.message}`);
}
