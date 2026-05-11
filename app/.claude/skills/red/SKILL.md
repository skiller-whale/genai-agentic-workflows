---
name: red
description: Use this skill to write a failing test for a described behaviour. Do not write implementation code.
version: 0.1.0
disable-model-invocation: true
---

# Red

Write a failing test for the behaviour described by the user.

## Steps

1. Write a test that captures the described behaviour.
   Add it to the appropriate existing test file, or create a new one if needed.
2. Do NOT write any implementation code.
3. Run the tests with `bun test` and confirm the new test fails.
4. Show the failing test output.

If the test passes without any implementation changes, something is wrong.
Stop and ask the user how to proceed.
