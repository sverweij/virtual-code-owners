import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { expect } from "chai";
import { readAndCovert } from "./read-and-convert.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

describe("reads and converts", () => {
  it("returns a CODEOWNERS as a string when passed file names of valid virtual code owners & virtual teams", () => {
    expect(
      readAndCovert(
        join(__dirname, "__mocks__", "VIRTUAL-CODEOWNERS.txt"),
        join(__dirname, "__mocks__", "virtual-teams.yml")
      )
    ).to.equal(
      readFileSync(join(__dirname, "__fixtures__", "CODEOWNERS"), {
        encoding: "utf-8",
      })
    );
  });
});
