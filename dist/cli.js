import { EOL } from "node:os";
import { parseArgs } from "node:util";
import { main } from "./main.js";
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
  --dryRun                             Just validate inputs, don't generate
                                       outputs (default: false)
  -h, --help                           display help for command`;
export function cli(
	pArguments = process.argv.slice(2),
	pOutStream = process.stdout,
	pErrorStream = process.stderr,
	pErrorExitCode = 1,
) {
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
		main(lOptions, pErrorStream);
	} catch (pError) {
		pErrorStream.write(`${EOL}ERROR: ${pError.message}${EOL}${EOL}`);
		process.exitCode = pErrorExitCode;
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
			dryRun: {
				type: "boolean",
				default: false,
			},
			help: { type: "boolean", short: "h", default: false },
			version: { type: "boolean", short: "V", default: false },
		},
		strict: true,
		allowPositionals: true,
		tokens: false,
	}).values;
}
