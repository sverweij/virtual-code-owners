import { equal } from "node:assert/strict";
import { describe, it } from "node:test";
import { isEmailIshUsername } from "./utensils";

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
});
