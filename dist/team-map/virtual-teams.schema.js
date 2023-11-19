export default {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "virtual teams schema for virtual-code-owners",
  description: "a list of teams and their team members",
  $id: "org.js.virtual-code-owners/7.0.0",
  type: "object",
  additionalProperties: {
    type: "array",
    items: {
      type: "string",
      description:
        "Username or e-mail address of a team member. (Don't prefix usernames with '@')",
      pattern: "^[^@][^\\s]+$",
    },
  },
};
