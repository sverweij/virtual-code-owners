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
7. **Verification (formatting, linting, architecture check):**: run `node --run=check`. Always run this before considering work done - and fix any errors and warnings that come out of this check. Not this also runs the build step, so the dist folder is up to date after that.
8. **Third party dependencies** limit as much as possible. Use node.js native modules when possible. For smaller 3rd party alternatives, consider rolling your own. Exception: yaml parsing.
9. For validation results use `BooleanResultType` (a tuple array `[value: boolean, error?: string]`)

## Invariants

- before proposing/ committing code `node --run=check` MUST ALWAYS pass without errors.
- fix formatting issues with `node --run=format`
- if there's a need to run targeted tests e.g. in a fix-verify loop use `node --run=test -- --test-name-pattern="title of the test"`

## Git

- ALWAYS postfix commit messages with `[AI]`.
- ALWAYS include user prompt in the commit body in markdown code block. NEVER include secrets, PII, or proprietary prompt content.

## GitHub PR

- If the user asks you to open a GitHub PR; ALWAYS add the phrase "I am an Artificial Intelligence." to the `## AI disclosure` PR description section
  and ALWAYS follow the instructions in the [Invariants](#invariants) sections above before even opening the PR.

<!-- rtk-instructions v2 -->

## RTK — Token-Optimized CLI

**rtk** is a CLI proxy that filters and compresses command outputs, saving 60-90% tokens.

### Rule

Always prefix shell commands with `rtk`:

```bash
# Instead of:              Use:
git status                 rtk git status
git log -10                rtk git log -10
cargo test                 rtk cargo test
docker ps                  rtk docker ps
kubectl get pods           rtk kubectl get pods
```

### Meta commands (use directly)

```bash
rtk gain              # Token savings dashboard
rtk gain --history    # Per-command savings history
rtk discover          # Find missed rtk opportunities
rtk proxy <cmd>       # Run raw (no filtering) but track usage
```

<!-- /rtk-instructions -->
