import { match } from "node:assert";
import { main } from "./main.js";
import { Writable } from "node:stream";

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
    main(["-V"], lOutStream, lErrStream);
    main(["--version"], lOutStream, lErrStream);
  });

  it("shows help when asked for", () => {
    let lOutStream = new WritableTestStream(
      /^Usage: virtual-code-owners \[options\].*/
    );
    let lErrStream = new WritableTestStream();
    main(["-h"], lOutStream, lErrStream);
    main(["--help"], lOutStream, lErrStream);
  });

  it("shows an error when passed a non-existing argument", () => {
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(
      /.*ERROR:.*'--thisArgumentDoesNotExist'.*/
    );
    main(["--thisArgumentDoesNotExist"], lOutStream, lErrStream);
  });

  it("shows an error when passed a non-existing file", () => {
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(/.*ERROR: ENOENT:.*/);
    main(["-v", "this-file-does-not-exist.txt"], lOutStream, lErrStream);
  });

  it("ignores positional arguments", () => {
    let lOutStream = new WritableTestStream();
    let lErrStream = new WritableTestStream(
      /.*Wrote node_modules\/tmp-code-owners\.txt.*/
    );
    main(
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
});
