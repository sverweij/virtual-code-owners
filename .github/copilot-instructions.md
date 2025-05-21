# GitHub Copilot Instructions for virtual-code-owners

This document outlines the coding patterns and standards for the virtual-code-owners repository.

## Project Overview

The `virtual-code-owners` project generates GitHub CODEOWNERS files from virtual team definitions. It merges:
- `VIRTUAL-CODEOWNERS.txt` (patterns × teams)
- `virtual-teams.yml` (teams × users)

## Code Structure Standards

### Module System
- Use ES Modules (ESM) exclusively
- Always use `.js` file extensions in import statements, even for TypeScript files
  ```typescript
  // Correct
  import { something } from './module.js';
  
  // Incorrect
  import { something } from './module';
  ```

### TypeScript Usage
- Target: ES2022
- Module: NodeNext
- Use strict TypeScript with explicit type declarations
- Use TypeScript interfaces for defining data structures
- Example pattern for function types:
  ```typescript
  function functionName(param: ParamType): ReturnType {
    // Implementation
  }

  type BooleanResultType = [value: boolean, error?: string];
  ```

### Formatting Style
- Use single quotes for strings
- Use 2-space indentation in source files
- Use tabs for indentation in output files

### Test Patterns
- Tests use Node.js built-in test runner:
  ```typescript
  import { equal } from 'node:assert/strict';
  import { describe, it } from 'node:test';
  
  describe('component name', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
  ```

### Project Structure
- Source code in `src/`
- Tests colocated with implementation files as `.test.ts`
- Test fixtures in `__fixtures__/` directories
- Type definitions in `.d.ts` files

### Common Patterns
- Return tuple arrays for validation results: `[success: boolean, error?: string]`
- Use Node.js native modules when possible
- For parsing files:
  ```typescript
  import { readFileSync } from 'node:fs';
  
  function parseFile(fileName: string): Result {
    const fileContents = readFileSync(fileName, {
      encoding: 'utf-8',
      flag: 'r',
    });
    // Implementation
  }
  ```

## Best Practices

1. **Types**: Use explicit TypeScript types and interfaces
2. **Imports**: Always use `.js` extension in imports
3. **Error Handling**: Provide clear error messages with context
4. **Code Organization**: Keep modules focused on single responsibilities
5. **Testing**: Write tests alongside implementation files
