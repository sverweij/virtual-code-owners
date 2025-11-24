import { doesNotThrow, match, throws } from "node:assert/strict";
import { accessSync, constants, rmSync } from "node:fs";
import { Writable } from "node:stream";
import { describe, it } from "node:test";
import { cli } from "./cli.js";

class WritableTestStream extends Writable {
  expected: RegExp | RegExp[] = /^$/;

  constructor(pExpected?: RegExp | RegExp[]) {
    super();
    if (pExpected) {
      this.expected = pExpected;
    }
  }
  write(pChunk) {
    if (Array.isArray(this.expected)) {
      this.expected.forEach((pExpectedRE) => {
        match(pChunk, pExpectedRE);
      });
    } else {
      match(pChunk, this.expected);
    }
    return true;
  }
}

describe("cli", () => {
  it("shows the version number when asked for", () => {
    const lOutStream = new WritableTestStream(/^\d+\.\d+\.\d+(-.+)?\n$/);
    const lErrStream = new WritableTestStream();
    cli(["-V"], lOutStream, lErrStream);
    cli(["--version"], lOutStream, lErrStream);
  });

  it("shows help when asked for", () => {
    const lOutStream = new WritableTestStream(
      /^Usage: virtual-code-owners \[options\].*/,
    );
    const lErrStream = new WritableTestStream();
    cli(["-h"], lOutStream, lErrStream);
    cli(["--help"], lOutStream, lErrStream);
  });

  it("shows an error when passed a non-existing argument", () => {
    const lOutStream = new WritableTestStream();
    const lErrStream = new WritableTestStream(
      /.*ERROR:.*'--thisArgumentDoesNotExist'.*/,
    );
    cli(["--thisArgumentDoesNotExist"], lOutStream, lErrStream, 0);
  });

  it("shows an error when passed a non-existing file", () => {
    const lOutStream = new WritableTestStream();
    const lErrStream = new WritableTestStream(/.*ERROR: ENOENT:.*/);
    cli(["-v", "this-file-does-not-exist.txt"], lOutStream, lErrStream);
  });

  it("shows an error when passed an invalid virtual-teams file", () => {
    const lOutStream = new WritableTestStream();
    const lErrStream = new WritableTestStream([
      /ERROR:/,
      /is not a valid virtual-teams\.yml:/,
      /This username doesn't match .+: '@daisy-duck'/,
      /This username doesn't match .+: 'john-galt-ch dagny-taggert-ch'/,
      /This username is not a string: '123456789'/,
      /This team is not an array: 'ch\/mannen-met-baarden'/,
    ]);
    cli(
      [
        "--virtualCodeOwners",
        "./src/__mocks__/virtual-codeowners.txt",
        "--virtualTeams",
        "./src/__mocks__/erroneous-virtual-teams.yml",
        "--codeOwners",
        "node_modules/tmp-code-owners.txt",
        "--emitLabeler",
        "--labelerLocation",
        "node_modules/tmp-labeler.yml",
      ],
      lOutStream,
      lErrStream,
      0,
    );
  });

  it("shows an error when passed an invalid virtual-teams file (invalid names)", () => {
    const lOutStream = new WritableTestStream();
    const lErrStream = new WritableTestStream([
      /ERROR:/,
      /is not a valid virtual-teams\.yml:/,
      /These team names are not valid: '' \(is an empty string\), 'team name with spaces' \(contains spaces\)/,
    ]);
    cli(
      [
        "--virtualCodeOwners",
        "./src/__mocks__/virtual-codeowners.txt",
        "--virtualTeams",
        "./src/__mocks__/erroneous-virtual-team-names.yml",
        "--codeOwners",
        "node_modules/tmp-code-owners.txt",
        "--emitLabeler",
        "--labelerLocation",
        "node_modules/tmp-labeler.yml",
      ],
      lOutStream,
      lErrStream,
      0,
    );
  });
  it("shows an error when passed an invalid virtual-teams file (name too long)", () => {
    const lOutStream = new WritableTestStream();
    const lErrStream = new WritableTestStream([
      /ERROR:/,
      /is not a valid virtual-teams\.yml:/,
      /These team names are not valid: 'team-name-that-is-longer-than-eighty-characters1234567890123456789012345678901234' \(is too long - keep it <= 80 characters\)/,
    ]);
    cli(
      [
        "--virtualCodeOwners",
        "./src/__mocks__/virtual-codeowners.txt",
        "--virtualTeams",
        "./src/__mocks__/erroneous-virtual-team-names-too-long.yml",
        "--codeOwners",
        "node_modules/tmp-code-owners.txt",
        "--emitLabeler",
        "--labelerLocation",
        "node_modules/tmp-labeler.yml",
      ],
      lOutStream,
      lErrStream,
      0,
    );
  });

  it("shows an error when passed an invalid virtual-teams file (not an object)", () => {
    const lOutStream = new WritableTestStream();
    const lErrStream = new WritableTestStream([
      /ERROR:/,
      /is not a valid virtual-teams\.yml:/,
      /The team map is not an object/,
    ]);
    cli(
      [
        "--virtualCodeOwners",
        "./src/__mocks__/virtual-codeowners.txt",
        "--virtualTeams",
        "./src/__mocks__/erroneous-virtual-team-is-an-array.yml",
        "--codeOwners",
        "node_modules/tmp-code-owners.txt",
        "--emitLabeler",
        "--labelerLocation",
        "node_modules/tmp-labeler.yml",
      ],
      lOutStream,
      lErrStream,
      0,
    );
  });

  it("shows an error when passed an invalid virtual-code-owners file", () => {
    const lOutStream = new WritableTestStream();
    const lErrStream = new WritableTestStream(
      /.*\.\/src\/__mocks__\/erroneous-virtual-codeowners.txt:16:1 invalid user or team name "jet" \(#6 on this line\). It should either start with "@" or be an e-mail address.*/,
    );
    cli(
      [
        "--virtualCodeOwners",
        "./src/__mocks__/erroneous-virtual-codeowners.txt",
        "--virtualTeams",
        "./src/__mocks__/virtual-teams.yml",
        "--codeOwners",
        "node_modules/tmp-code-owners.txt",
        "--emitLabeler",
        "--labelerLocation",
        "node_modules/tmp-labeler.yml",
      ],
      lOutStream,
      lErrStream,
      0,
    );
  });

  it("with --dryRun, still shows an error when passed an invalid virtual-code-owners file", () => {
    const lOutStream = new WritableTestStream();
    const lErrStream = new WritableTestStream(
      /.*\.\/src\/__mocks__\/erroneous-virtual-codeowners.txt:16:1 invalid user or team name "jet" \(#6 on this line\). It should either start with "@" or be an e-mail address.*/,
    );
    cli(
      [
        "--virtualCodeOwners",
        "./src/__mocks__/erroneous-virtual-codeowners.txt",
        "--virtualTeams",
        "./src/__mocks__/virtual-teams.yml",
        "--codeOwners",
        "node_modules/tmp-code-owners.txt",
        "--emitLabeler",
        "--labelerLocation",
        "node_modules/tmp-labeler.yml",
        "--dryRun",
      ],
      lOutStream,
      lErrStream,
      0,
    );
  });

  it("ignores positional arguments", () => {
    const lOutStream = new WritableTestStream();
    const lErrStream = new WritableTestStream(
      /.*Wrote 'node_modules\/tmp-code-owners\.txt'.*/,
    );
    cli(
      [
        "--virtualCodeOwners",
        "./src/__mocks__/VIRTUAL-CODEOWNERS.txt",
        "--virtualTeams",
        "./src/__mocks__/virtual-teams.yml",
        "--codeOwners",
        "node_modules/tmp-code-owners.txt",
        "few",
        "positional",
        "arguments",
      ],
      lOutStream,
      lErrStream,
    );
  });

  it("shows that both a codeowners and a labeler file were generated when --emitLabeler is used + emits files", () => {
    const lOutStream = new WritableTestStream();
    const lErrStream = new WritableTestStream(
      /.*Wrote 'node_modules\/tmp-code-owners\.txt' AND 'node_modules\/tmp-labeler.yml'.*/,
    );
    const lCodeOwnersFileName = "node_modules/tmp-code-owners.txt";
    const lLabelerFileName = "node_modules/tmp-labeler.yml";
    rmSync(lCodeOwnersFileName, { force: true });
    rmSync(lLabelerFileName, { force: true });
    cli(
      [
        "--virtualCodeOwners",
        "./src/__mocks__/VIRTUAL-CODEOWNERS.txt",
        "--virtualTeams",
        "./src/__mocks__/virtual-teams.yml",
        "--codeOwners",
        lCodeOwnersFileName,
        "--emitLabeler",
        "--labelerLocation",
        lLabelerFileName,
      ],
      lOutStream,
      lErrStream,
      0,
    );
    doesNotThrow(() => {
      accessSync(lCodeOwnersFileName, constants.R_OK);
    });
    doesNotThrow(() => {
      accessSync(lLabelerFileName, constants.R_OK);
    });
    rmSync(lCodeOwnersFileName, { force: true });
    rmSync(lLabelerFileName, { force: true });
  });

  it("with --dryRun, still shows that both a codeowners and a labeler file were generated when --emitLabeler is used + does not emit files", () => {
    const lOutStream = new WritableTestStream();
    const lErrStream = new WritableTestStream(
      /.*Wrote 'node_modules\/tmp-dry-run-so-shouldnt-exist-code-owners\.txt' AND 'node_modules\/tmp-dry-run-so-shouldnt-exist-labeler.yml'.*/,
    );
    cli(
      [
        "--virtualCodeOwners",
        "./src/__mocks__/VIRTUAL-CODEOWNERS.txt",
        "--virtualTeams",
        "./src/__mocks__/virtual-teams.yml",
        "--codeOwners",
        "node_modules/tmp-dry-run-so-shouldnt-exist-code-owners.txt",
        "--emitLabeler",
        "--labelerLocation",
        "node_modules/tmp-dry-run-so-shouldnt-exist-labeler.yml",
        "--dryRun",
      ],
      lOutStream,
      lErrStream,
      0,
    );

    throws(() => {
      accessSync(
        "node_modules/tmp-dry-run-so-shouldnt-exist-code-owners.txt",
        constants.R_OK,
      );
    }, /ENOENT/);
    throws(() => {
      accessSync(
        "node_modules/tmp-dry-run-so-shouldnt-exist-labeler.yml",
        constants.R_OK,
      );
    }, /ENOENT/);
  });
});
