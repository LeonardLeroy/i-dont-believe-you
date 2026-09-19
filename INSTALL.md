# Install

The skill is one file. Every method below puts
[`skills/verify-before-claiming/SKILL.md`](skills/verify-before-claiming/SKILL.md) somewhere your
agent reads.

Use `~/` instead of the project path to install it once for every repository on the machine.

## Verified

These paths have been confirmed against the agent's own documentation.

### Claude Code

```bash
mkdir -p .claude/skills/verify-before-claiming && curl -sL https://raw.githubusercontent.com/LeonardLeroy/i-dont-believe-you/main/skills/verify-before-claiming/SKILL.md -o .claude/skills/verify-before-claiming/SKILL.md
```

### Codex CLI

Project-level `.codex/skills/`, or `~/.codex/skills/` for every project.

```bash
mkdir -p .codex/skills/verify-before-claiming && curl -sL https://raw.githubusercontent.com/LeonardLeroy/i-dont-believe-you/main/skills/verify-before-claiming/SKILL.md -o .codex/skills/verify-before-claiming/SKILL.md
```

## Unverified

The paths below were written without access to the agent. They may be wrong. If you use one of
these, please confirm the path and
[correct it](https://github.com/LeonardLeroy/i-dont-believe-you/labels/good%20first%20issue).
It is a one-line change to `targets` in `src/install-skill.ts`.

| Agent                  | Path                |
| ---------------------- | ------------------- |
| Cursor                 | `.cursor/skills/`   |
| opencode               | `.opencode/skills/` |
| `AGENTS.md` convention | `.agents/skills/`   |

```bash
npx i-dont-believe-you install-skill --target cursor
```

Run `npx i-dont-believe-you install-skill` with no target to list them, or `--dest <dir>` to
install anywhere.

## Anywhere else

Copy the file. It has no dependencies and refers to nothing outside itself:

```bash
curl -sL https://raw.githubusercontent.com/LeonardLeroy/i-dont-believe-you/main/skills/verify-before-claiming/SKILL.md
```

## Checking it took

Ask your agent to make a change that skips a test, then ask whether the tests pass. If the skill
is loaded, it runs the eight commands and refuses to claim success.

If it claims success anyway, that is worth
[an issue](https://github.com/LeonardLeroy/i-dont-believe-you/issues/new): which agent, which
version, and what it said.
