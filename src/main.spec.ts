import { match } from "node:assert";
import { Writable } from "node:stream";
import { cli } from "./main.js";

class WritableTestStream extends Writable {
  expected = /^$/;

  constructor(pExpected?: RegExp) {
    super();
    if (pExpected) {
      this.expected = pExpected;
    }
  }
  write(pChunk) {
    match(pChunk, this.expected);
    return true;
  }
}

describe("main", () => {
  it("shows the version number when asked for", () => {
    let lOutStream = new WritableTestStream(/^[0-9]+\.[0-9]+\.[0-9]+(-.+)?\n$/);
    let lErrStream = new WritableTestStream();
    cli(["-V"], lOutStream, lErrStream);
    cli(["--version"], lOutStream, lErrStream);
  });

  it("shows help when asked for", () => {
    let lOutStream = new WritableTestStream(
      /^Usage: virtual-code-owners \[options\].*/
    );
    let lErrStream = new WritableTestStream();
    cli(["-h"], lOutStream, lErrStream);
    cli(["--help"], lOutStream, lErrStream);
  });

  it("shows an error when passed a non-existing argument", () => {
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(
      /.*ERROR:.*'--thisArgumentDoesNotExist'.*/
    );
    cli(["--thisArgumentDoesNotExist"], lOutStream, lErrStream);
  });

  it("shows an error when passed a non-existing file", () => {
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(/.*ERROR: ENOENT:.*/);
    cli(["-v", "this-file-does-not-exist.txt"], lOutStream, lErrStream);
  });

  it("shows an error when passed an invalid virtual-code-owners file", () => {
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(
      /.*\.\/src\/__mocks__\/erroneous-virtual-codeowners.txt:16:1 invalid user or team name "jet" \(#6 on this line\). It should either start with "@" or be an e-mail address.*/
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
      lErrStream
    );
  });

  it("ignores positional arguments", () => {
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(
      /.*Wrote 'node_modules\/tmp-code-owners\.txt'.*/
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
      lErrStream
    );
  });

  it("shows that both a codeowners and a labeler file were generated when --emitLabeler is used", () => {
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(
      /.*Wrote 'node_modules\/tmp-code-owners\.txt' AND 'node_modules\/tmp-labeler.yml'.*/
    );
    cli(
      [
        "--virtualCodeOwners",
        "./src/__mocks__/VIRTUAL-CODEOWNERS.txt",
        "--virtualTeams",
        "./src/__mocks__/virtual-teams.yml",
        "--codeOwners",
        "node_modules/tmp-code-owners.txt",
        "--emitLabeler",
        "--labelerLocation",
        "node_modules/tmp-labeler.yml",
      ],
      lOutStream,
      lErrStream
    );
  });
});
