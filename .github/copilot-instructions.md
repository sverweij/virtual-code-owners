# GitHub Copilot Instructions for virtual-code-owners

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
6. **Testing**: Write tests alongside implementation files. Use node:test and node:assert/strict. fixtures in `__fixtures__/` directories
7. **Formatting**: run `node --run=format`
8. **Third party dependencies** limit as much as possible. Use node.js native modules when possible. For smaller 3rd party alternatives, consider rolling your own. Exception: yaml parsing.
9. For validation results use `BooleanResultType` (a tuple array `[value: boolean, error?: string]`)
