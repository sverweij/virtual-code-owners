import { VERSION } from "./version.js";
import parseAndGenerateCodeOwners from "./parse-and-generate.js";
import parseAndGenerateLabelerYml from "./parse-and-generate-labeler-yml.js";
import { writeFileSync } from "node:fs";
import { EOL } from "node:os";
import { parseArgs } from "node:util";
const HELP_MESSAGE = `Usage: virtual-code-owners [options]

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
  -l, --emitLabeler                    Whether or not to emit a labeler.yml to be
                                       used with actions/labeler
                                       (default: false)
  --labelerLocation [file-name]        The location of the labeler.yml file
                                       (default: ".github/labeler.yml")
  -h, --help                           display help for command`;
export function main(pArguments = process.argv.slice(2), pOutStream = process.stdout, pErrorStream = process.stderr) {
    try {
        let lOptions = getOptions(pArguments);
        if (lOptions.help) {
            pOutStream.write(`${HELP_MESSAGE}${EOL}`);
            return;
        }
        if (lOptions.version) {
            pOutStream.write(`${VERSION}${EOL}`);
            return;
        }
        const lCodeOwnersContent = parseAndGenerateCodeOwners(lOptions.virtualCodeOwners, lOptions.virtualTeams);
        writeFileSync(lOptions.codeOwners, lCodeOwnersContent, {
            encoding: "utf-8",
        });
        if (lOptions.emitLabeler) {
            const lLabelerContent = parseAndGenerateLabelerYml(lOptions.virtualCodeOwners, lOptions.virtualTeams);
            writeFileSync(lOptions.labelerLocation, lLabelerContent, {
                encoding: "utf-8",
            });
            pErrorStream.write(`${EOL}Wrote ${lOptions.codeOwners} AND ${lOptions.labelerLocation}${EOL}${EOL}`);
        }
        else {
            pErrorStream.write(`${EOL}Wrote ${lOptions.codeOwners}${EOL}${EOL}`);
        }
    }
    catch (pError) {
        pErrorStream.write(`${EOL}ERROR: ${pError.message}${EOL}${EOL}`);
        process.exitCode = 1;
    }
}
function getOptions(pArguments) {
    return parseArgs({
        args: pArguments,
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
            codeOwners: {
                type: "string",
                short: "c",
                default: ".github/CODEOWNERS",
            },
            emitLabeler: {
                type: "boolean",
                short: "l",
                default: false,
            },
            labelerLocation: {
                type: "string",
                default: ".github/labeler.yml",
            },
            help: { type: "boolean", short: "h", default: false },
            version: { type: "boolean", short: "V", default: false },
        },
        strict: true,
        allowPositionals: true,
        tokens: false,
    }).values;
}
