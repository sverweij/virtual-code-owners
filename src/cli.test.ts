import { doesNotThrow, match, throws } from "node:assert";
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
    let lOutStream = new WritableTestStream(/^[0-9]+\.[0-9]+\.[0-9]+(-.+)?\n$/);
    let lErrStream = new WritableTestStream();
    cli(["-V"], lOutStream, lErrStream);
    cli(["--version"], lOutStream, lErrStream);
  });

  it("shows help when asked for", () => {
    let lOutStream = new WritableTestStream(
      /^Usage: virtual-code-owners \[options\].*/,
    );
    let lErrStream = new WritableTestStream();
    cli(["-h"], lOutStream, lErrStream);
    cli(["--help"], lOutStream, lErrStream);
  });

  it("shows an error when passed a non-existing argument", () => {
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(
      /.*ERROR:.*'--thisArgumentDoesNotExist'.*/,
    );
    cli(["--thisArgumentDoesNotExist"], lOutStream, lErrStream, 0);
  });

  it("shows an error when passed a non-existing file", () => {
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(/.*ERROR: ENOENT:.*/);
    cli(["-v", "this-file-does-not-exist.txt"], lOutStream, lErrStream);
  });

  it("shows an error when passed an invalid virtual-teams file", () => {
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream([
      /ERROR: This is not a valid virtual-teams\.yml:/,
      /src\/__mocks__\/erroneous\-virtual\-teams\.yml: \/ch~1after-sales\/3 - "@daisy-duck" must match pattern/,
      /src\/__mocks__\/erroneous\-virtual\-teams\.yml: \/ch~1pre-sales\/3 - "john-galt-ch dagny-taggert-ch" must match pattern/,
      /src\/__mocks__\/erroneous-virtual-teams.yml: \/ch~1mannen-met-baarden - "arie - jan@example.com - pier@example.com - tjorus@example.com - korneel@example.com" must be array/,
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

  it("shows an error when passed an invalid virtual-code-owners file", () => {
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(
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
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(
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
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(
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
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(
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
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(
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
