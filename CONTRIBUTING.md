# Contributing

The product is [`skills/verify-before-claiming/SKILL.md`](skills/verify-before-claiming/SKILL.md).
Everything else exists to prove it works and to get it installed.

## Setup

```bash
git clone https://github.com/LeonardLeroy/i-dont-believe-you.git
cd i-dont-believe-you
npm install
npm run evals
```

`npm run evals` extracts the shell commands straight out of `SKILL.md` and runs them against real
throwaway git repositories. If you change a command in the skill, the evals are what catch it.

`npm test`, `npm run lint` and `npm run typecheck` cover the harness and the optional CLI.

## Finding something to work on

Start with [`good first issue`](https://github.com/LeonardLeroy/i-dont-believe-you/labels/good%20first%20issue),
then [`help wanted`](https://github.com/LeonardLeroy/i-dont-believe-you/labels/help%20wanted).

Three contributions are always welcome and need no prior discussion:

- **An eval case.** `evals/cases/<name>/` holds a `before/` tree, an `after/` tree, the `claim.txt`
  your agent made, and `expected.json` listing which checks should fire. Copy an existing case.
  Sessions where your agent actually lied are the most valuable thing you can send.
- **A check.** A new `### N.` section in `SKILL.md` with a `<!-- check: id -->` marker, its bash
  block, and an eval case proving it fires.
- **A language.** Widen the patterns in the existing six commands so they cover another test
  framework, and add a case.

## Rules for a check

- It must be one shell command that prints nothing when there is no problem.
- It must run in under a second on a large repository.
- It must not need anything beyond `git`, `grep`, `sed`, `comm` and bash.
- A false positive is worse than a miss. If you are unsure a pattern is safe, say so in the PR
  rather than widening it.

## After editing the skill

The skill is committed under `.claude/`, `.cursor/`, `.opencode/` and `.agents/` as well. Run:

```bash
npm run sync-skill
```

CI fails if those copies drift.

## Pull requests

Commits follow [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`,
`docs:`, `test:`, `chore:`). CI checks the PR title.

## Questions

Open a [discussion](https://github.com/LeonardLeroy/i-dont-believe-you/discussions) or ask in the
issue you are working on.
