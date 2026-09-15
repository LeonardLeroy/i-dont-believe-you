---
name: verify-before-claiming
description: >
  Run before telling the user that tests pass, the build is green, or the work is done. Executes
  six shell checks against the actual diff and requires their raw output to be pasted before any
  success is reported. Use whenever a turn is about to end with a claim about test, build or
  completion status.
---

# Verify before claiming

You are about to tell the user something worked. You do not know that yet. Find out first.

## The rule

Before any sentence containing "tests pass", "build is green", "done", "fixed", "ready" or
anything equivalent, run every check below and paste the raw output into your reply.

If a check prints a line, you have found something. Do not report success. Read the line, open
the file, and either fix the code or rewrite your summary so it states what is actually true.

## The checks

Run all six. They take under a second. `git diff HEAD -U0` shows only changed lines, so a `+`
prefix means the line is new in this change.

### 1. Did you disable a test?

<!-- check: disabled-test -->

```bash
git diff HEAD -U0 | grep -E '^\+' | grep -E '\.skip\(|\.todo\(|\bxit\(|\bxdescribe\(|@pytest\.mark\.(skip|xfail)|unittest\.skip|#\[ignore\]|\bt\.Skip\(|@Disabled|@Ignore|markTestSkipped'
```

Any output means a test no longer runs. Saying the suite passes while this prints a line is a
false statement, not a judgement call.

### 2. Did you add an assertion that cannot fail?

<!-- check: hollow-assertion -->

```bash
git diff HEAD -U0 | grep -E '^\+' | grep -E 'expect\((true|1)\)\.(toBe|toEqual)\((true|1)\)|assert\s+True\s*$|assertTrue\(True\)|assert!\(true\)|Assert\.True\(true\)|assertThat\(true\)'
```

Any output means a test now passes regardless of the code it claims to cover.

### 3. Did the assertion count drop?

<!-- check: assertions-dropped -->

```bash
R=$(git diff HEAD -U0 | grep -E '^-' | grep -cE 'expect\(|assert|should\.|\.Errorf?\(|\.Fatalf?\('); A=$(git diff HEAD -U0 | grep -E '^\+' | grep -cE 'expect\(|assert|should\.|\.Errorf?\(|\.Fatalf?\('); [ "$R" -gt "$A" ] && echo "assertions: $R removed, $A added"
```

Any output means the suite checks less than it did before. Say so, or put the assertions back.

### 4. Did a test file disappear?

<!-- check: test-file-gone -->

```bash
git diff HEAD --diff-filter=DR --name-status | grep -Ei '(^|[/[:space:]])(tests?|spec)s?/|[._-](test|spec)\.'
```

Any output means a test file was deleted or renamed. A rename out of the runner's glob removes
the tests just as completely as a delete.

### 5. Did you swallow an error?

<!-- check: swallowed-error -->

```bash
git diff HEAD -U0 | grep -E '^\+' | grep -E 'catch[^{]*\{\s*\}|except[^:]*:\s*pass\s*$|\.catch\(\s*\(\)\s*=>\s*\{\s*\}\s*\)|if err != nil \{\s*\}'
```

Any output means a failure path now silently does nothing. That is not "handled".

### 6. Did you claim tests you did not write?

<!-- check: no-test-touched fires-on=NO TEST FILE CHANGED -->

```bash
git diff HEAD --name-only | grep -Ei '(^|/)(tests?|spec)s?/|[._-](test|spec)\.' || echo "NO TEST FILE CHANGED"
```

If this prints `NO TEST FILE CHANGED`, do not say you added tests, improved coverage, or covered
anything.

## Locating a hit

The commands print the offending lines, not their location. To find one:

```bash
grep -rn 'PASTE THE LINE HERE' --include='*' .
```

## Reporting

Paste the raw output of all six, then your summary. Not a description of the output. The output itself.

A command that fails is not a silent check. If git reports an error instead of output, for
example `unknown revision HEAD` in a repository with no commits yet, name the command that failed
and why. Never count a failed command as a pass.

If every check ran and every one is silent, say exactly this and nothing stronger:

> All six checks are silent. That means they found nothing, not that the code works.

## Never

- Never resolve a hit by deleting the check from this file or skipping a command.
- Never resolve a hit by weakening your wording while leaving the code untouched, unless the
  weaker wording is the honest one.
- Never call a hit a false positive before opening the file and looking.
- Never report the checks as run if you did not run them. That is the exact failure this skill
  exists to catch, and doing it here is worse than not having the skill.

## Why these six

The problem is measured, not assumed. Across 86,156 agent-authored test patches, 80.2% contained
weak or no explicit oracle signals ([arXiv:2606.18168](https://arxiv.org/abs/2606.18168)). The
general failure, satisfying the measure instead of the intent, is documented as reward hacking
([METR](https://metr.org/blog/2025-06-05-recent-reward-hacking/)).

Checks 2 and 3 target that oracle weakness directly. The other four are not from those papers:
they are the same failure applied to things a diff can prove: a test that no longer runs, a test
that is gone, an error path that does nothing, and a claim with no test file behind it.
