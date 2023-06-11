import { writeFileSync } from "node:fs";
import { EOL } from "node:os";
import { parseArgs } from "node:util";
import generateCodeOwners from "./generate-codeowners.js";
import generateLabelerYml from "./generate-labeler-yml.js";
import { getAnomalies } from "./parse.js";
import readTeamMap from "./read-team-map.js";
import readVirtualCodeOwners from "./read-virtual-code-owners.js";
import { VERSION } from "./version.js";
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
        const lOptions = getOptions(pArguments);
        if (lOptions.help) {
            pOutStream.write(`${HELP_MESSAGE}${EOL}`);
            return;
        }
        if (lOptions.version) {
            pOutStream.write(`${VERSION}${EOL}`);
            return;
        }
        const lTeamMap = readTeamMap(lOptions.virtualTeams);
        const lVirtualCodeOwners = readVirtualCodeOwners(lOptions.virtualCodeOwners, lTeamMap);
        const lAnomalies = getAnomalies(lVirtualCodeOwners);
        if (lAnomalies.length > 0) {
            throw new Error(`${EOL}${reportAnomalies(lOptions.virtualCodeOwners, lAnomalies)}`);
        }
        const lCodeOwnersContent = generateCodeOwners(lVirtualCodeOwners, lTeamMap);
        writeFileSync(lOptions.codeOwners, lCodeOwnersContent, {
            encoding: "utf-8",
        });
        if (lOptions.emitLabeler) {
            const lLabelerContent = generateLabelerYml(lVirtualCodeOwners, lTeamMap);
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
function reportAnomalies(pFileName, pAnomalies) {
    return pAnomalies
        .map((pAnomaly) => {
        if (pAnomaly.type === "invalid-line") {
            return `${pFileName}:${pAnomaly.line}:1 invalid line - neither a rule, comment nor empty: '${pAnomaly.raw}'`;
        }
        else {
            return (`${pFileName}:${pAnomaly.line}:1 invalid user or team name '${pAnomaly.raw}' (# ${pAnomaly.userNumberWithinLine} on this line). ` +
                `It should either start with '@' or be an e-mail address.`);
        }
    })
        .join(EOL);
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
