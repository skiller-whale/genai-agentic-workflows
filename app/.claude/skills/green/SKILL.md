---
name: green
description: Use this skill to write the minimum implementation code to make the failing tests pass.
version: 0.1.0
disable-model-invocation: true
---

# Green

Write the minimum implementation code needed to make the failing tests pass.

## Steps

1. Run `bun test` to identify the failing tests.
2. Write the minimum implementation code to make them pass.
   Do not add functionality beyond what the tests require.
3. Run `bun test` again and confirm all tests now pass.
4. Show the passing test output.

If you cannot make the tests pass without significant design changes, stop and
discuss with the user before proceeding.
