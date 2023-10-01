import { deepEqual } from "node:assert/strict";
import { describe, it } from "node:test";
import type { IVirtualCodeOwnersCST } from "./cst.js";
import { parse } from "./parse.js";
import { getAnomalies } from "./anomalies.js";

describe("anomaly detection", () => {
  it("reports an invalid line", () => {
    const erroneousLine = "this-is-not-a-valid-rule-or-comment";
    const lVirtualCodeOwners = parse(erroneousLine);
    const lFound = getAnomalies(lVirtualCodeOwners);
    const lExpected = [
      {
        type: "invalid-line",
        line: 1,
        raw: "this-is-not-a-valid-rule-or-comment",
      },
    ];
    deepEqual(lFound, lExpected);
  });

  it("reports an invalid user", () => {
    const erroneousLine = "some/pattern/ username-without-an-at";
    const lVirtualCodeOwners = parse(erroneousLine);
    const lFound = getAnomalies(lVirtualCodeOwners);
    const lExpected = [
      {
        type: "invalid-user",
        line: 1,
        userNumberWithinLine: 1,
        bareName: "username-without-an-at",
        raw: "username-without-an-at",
      },
    ];
    deepEqual(lFound, lExpected);
  });

  it("reports invalid users and lines (ordered by line number, username on that line)", () => {
    const lInput = `some/pattern/  tjorus@example.com username-without-an-at @normal-username
      some/other/pattern @team1 without-at @team2   team3-but-without-an-at 
      #comment - next line is empty

      #!ignorable-comment
      # next line is an error
      -
      # as is the next one
      aintthatcutebutitisWRONG
      `;
    const lVirtualCodeOwners = parse(lInput);
    const lFound = getAnomalies(lVirtualCodeOwners);
    const lExpected = [
      {
        type: "invalid-user",
        line: 1,
        userNumberWithinLine: 2,
        bareName: "username-without-an-at",
        raw: "username-without-an-at",
      },
      {
        type: "invalid-user",
        line: 2,
        userNumberWithinLine: 2,
        bareName: "without-at",
        raw: "without-at",
      },
      {
        type: "invalid-user",
        line: 2,
        userNumberWithinLine: 4,
        bareName: "team3-but-without-an-at",
        raw: "team3-but-without-an-at",
      },
      {
        type: "invalid-line",
        line: 7,
        raw: "      -",
      },
      {
        type: "invalid-line",
        line: 9,
        raw: "      aintthatcutebutitisWRONG",
      },
    ];
    deepEqual(lFound, lExpected);
  });

  it("reports users in the same order as they appear", () => {
    const lVirtualCodeOwners: IVirtualCodeOwnersCST = [
      {
        type: "rule",
        filesPattern: "yadda/yadda/",
        line: 1,
        raw: "yadda/yadda/ @one @atwo three @four @five six @seven eight",
        spaces: " ",
        users: [
          {
            type: "other-user-or-team",
            bareName: "one",
            userNumberWithinLine: 1,
            raw: "@one",
          },
          {
            type: "invalid",
            bareName: "three",
            userNumberWithinLine: 3,
            raw: "three",
          },
          {
            type: "other-user-or-team",
            bareName: "four",
            userNumberWithinLine: 4,
            raw: "four",
          },
          {
            type: "invalid",
            bareName: "eight",
            userNumberWithinLine: 8,
            raw: "eight",
          },
          {
            type: "other-user-or-team",
            bareName: "five",
            userNumberWithinLine: 5,
            raw: "@five",
          },
          {
            type: "invalid",
            bareName: "six",
            userNumberWithinLine: 6,
            raw: "six",
          },
          {
            type: "other-user-or-team",
            bareName: "seven",
            userNumberWithinLine: 7,
            raw: "@seven",
          },
          {
            type: "other-user-or-team",
            bareName: "two",
            userNumberWithinLine: 2,
            raw: "@two",
          },
        ],
        inlineComment: "",
      },
    ];
    const lFound = getAnomalies(lVirtualCodeOwners);
    const lExpected = [
      {
        type: "invalid-user",
        line: 1,
        userNumberWithinLine: 3,
        bareName: "three",
        raw: "three",
      },
      {
        type: "invalid-user",
        line: 1,
        userNumberWithinLine: 6,
        bareName: "six",
        raw: "six",
      },
      {
        type: "invalid-user",
        line: 1,
        userNumberWithinLine: 8,
        bareName: "eight",
        raw: "eight",
      },
    ];
    deepEqual(lFound, lExpected);
  });
});
