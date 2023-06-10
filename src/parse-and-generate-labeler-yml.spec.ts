import { equal } from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import generate from "./parse-and-generate-labeler-yml.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

describe("parses and generates a labeler yml", () => {
  it("returns a labeler.yml as a string when passed file names of valid virtual code owners & virtual teams", () => {
    equal(
      generate(
        join(__dirname, "__mocks__", "VIRTUAL-CODEOWNERS.txt"),
        join(__dirname, "__mocks__", "virtual-teams.yml")
      ),
      readFileSync(join(__dirname, "__fixtures__", "labeler.yml"), "utf-8")
    );
  });
});
