---
name: refactor
description: Use this skill to refactor the code for quality improvements without changing behaviour.
version: 0.1.0
disable-model-invocation: true
---

# Refactor

Improve the quality of the code without changing its behaviour.

## Steps

1. Run `bun test` to confirm all tests are currently passing.
2. Review the code for quality improvements such as:
   - Removing duplication
   - Improving naming
   - Simplifying logic
   - Improving structure
3. Make one small refactoring change at a time.
4. After each change, run `bun test` to confirm all tests still pass.
5. Continue until you are satisfied with the code quality.

Do not add new features or change behaviour.
If a refactoring step causes tests to fail, undo it and try a different approach.
