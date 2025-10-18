import { equal } from "node:assert/strict";
import { describe, it } from "node:test";
import { bracketsMatch, isEmailIshUsername } from "./utensils";

describe("utensils - isEmailIshUsername", () => {
  it("should return true for email-like usernames", () => {
    equal(isEmailIshUsername("john@example.com"), true);
    equal(isEmailIshUsername("jane.doe@example.com"), true);
    equal(isEmailIshUsername("jane.doe+test@example.com"), true);
  });

  it("should return false for non-email-like usernames", () => {
    equal(isEmailIshUsername("john"), false);
    equal(isEmailIshUsername("jane.doe"), false);
    equal(isEmailIshUsername("jane.doe+test"), false);
    equal(isEmailIshUsername("john@"), false);
    equal(isEmailIshUsername("@example.com"), false);
  });

  describe("utensils - bracketsMatch", () => {
    it("should return true for matching brackets", () => {
      equal(bracketsMatch("[]"), true);
      equal(bracketsMatch("[abc]"), true);
      equal(bracketsMatch("[[]]"), true);
      equal(bracketsMatch("[a[b]c]"), true);
      equal(bracketsMatch(""), true);
      equal(bracketsMatch("abc"), true);
      equal(bracketsMatch("[abc][42] def # ]]]"), true);
    });

    it("should return false for mismatched brackets", () => {
      equal(bracketsMatch("["), false);
      equal(bracketsMatch("]"), false);
      equal(bracketsMatch("[["), false);
      equal(bracketsMatch("]]"), false);
      equal(bracketsMatch("]["), false);
      equal(bracketsMatch("[[]"), false);
      equal(bracketsMatch("[[] # ]"), false);
    });
  });
});
