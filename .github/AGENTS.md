# LLM Agent instructions for virtual-code-owners

## Project Overview

The `virtual-code-owners` project generates GitHub CODEOWNERS files from virtual team definitions. It merges:

- `VIRTUAL-CODEOWNERS.txt` (patterns × teams)
- `virtual-teams.yml` (teams × users)

and optionally emits a `labeler.yaml` used by `actions/labeler`

## Best Practices

1. **Types**: Use explicit TypeScript types and interfaces
2. **Module system**: ESM
3. **Imports**: Always use `.js` extension in imports
4. **Error Handling**: Provide clear error messages with context
5. **Code Organization**: Keep modules focused on single responsibilities
6. **Testing**: Write tests alongside implementation files. Use node:test and node:assert/strict. fixtures in `__fixtures__/` directories. Strive for 100% code coverage (verify with `node --run=test`). Run tests individual tests with `node --run=test -- --test-name-pattern="title of the test(s)"`.
8. **Verification (formatting, linting, architecture check):**: run `node --run=check`. Always run this before considering work done - and fix any errors and warnings that come out of this check. Not this also runs the build step, so the dist folder is up to date after that.
9. **Third party dependencies** limit as much as possible. Use node.js native modules when possible. For smaller 3rd party alternatives, consider rolling your own. Exception: yaml parsing.
10. For validation results use `BooleanResultType` (a tuple array `[value: boolean, error?: string]`)
