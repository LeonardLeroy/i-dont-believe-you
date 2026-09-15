# Working in this repository

The product is `skills/verify-before-claiming/SKILL.md`. Everything else exists to prove it works
and to get it installed.

## Before you claim anything here

This repository ships a skill that forbids unverified success claims. Apply it to your own work
in it. Run the six commands in `SKILL.md` against your diff before you report that anything
passes, and paste the output.

## Commands

```bash
npm install
npm run evals            # runs the SKILL.md commands against throwaway git repos
npm test                 # harness and optional CLI
npm run lint
npm run typecheck
npm run sync-skill       # after editing SKILL.md
npm run sync-skill:check # what CI runs
```

## Layout

| Path                                            | What it is                                        |
| ----------------------------------------------- | ------------------------------------------------- |
| `skills/verify-before-claiming/SKILL.md`        | the product                                       |
| `evals/cases/<name>/`                           | `before/`, `after/`, `claim.txt`, `expected.json` |
| `evals/skill.ts`                                | extracts the commands out of `SKILL.md`           |
| `src/`                                          | optional CLI running the same checks as a CI gate |
| `.claude/ .codex/ .cursor/ .opencode/ .agents/` | generated copies, do not edit by hand             |

## Rules for a check

- One shell command, silent when there is no problem.
- Nothing beyond `git`, `grep` and a POSIX shell.
- Under a second on a large repository.
- A false positive is worse than a miss.

## If you edit SKILL.md

Every bash block that is a check needs a `<!-- check: id -->` marker, or the evals will not see
it and `tests/skill.test.ts` will fail. Run `npm run sync-skill` afterwards.
