import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readAndCovert } from "./read-and-convert";

describe("reads and converts", () => {
  it("returns a CODEOWNERS as a string when passed file names of valid virtual code owners & virtual teams", () => {
    expect(
      readAndCovert(
        join(__dirname, "__mocks__", "VIRTUAL-CODEOWNERS.txt"),
        join(__dirname, "__mocks__", "virtual-teams.yml")
      )
    ).toEqual(
      readFileSync(join(__dirname, "__fixtures__", "CODEOWNERS"), {
        encoding: "utf-8",
      })
    );
  });
});
