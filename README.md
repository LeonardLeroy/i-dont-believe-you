<p align="center">
  <img src="./logo.png" alt="i-dont-believe-you" width="140" />
</p>

<p align="center">
  <strong>Your agent says the tests pass. Make it prove it.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT" /></a>
  <a href="https://github.com/LeonardLeroy/i-dont-believe-you/actions/workflows/ci.yml"><img src="https://github.com/LeonardLeroy/i-dont-believe-you/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
</p>

<p align="center">
  <strong>EN</strong> · <a href=".github/readme/README.fr.md">FR</a> · <a href=".github/readme/README.es.md">ES</a>
</p>

## Install

```bash
mkdir -p .claude/skills/verify-before-claiming && curl -sL https://raw.githubusercontent.com/LeonardLeroy/i-dont-believe-you/main/skills/verify-before-claiming/SKILL.md -o .claude/skills/verify-before-claiming/SKILL.md
```

Codex, Cursor, opencode and others: [INSTALL.md](INSTALL.md).

## What it does

Before your agent can tell you anything passed, it has to run six shell commands against the real
diff and paste the output. If one prints a line, it is not allowed to claim success.

No dependencies, no API key, no model. One markdown file.

## What changes

Same task, same agent. On the left, what it tells you today. On the right, what it has to
tell you once the skill is installed.

| Your agent today | Your agent with the skill |
| --- | --- |
| Fixed the retry logic.<br><br>✅ All tests pass. Ready to merge. | Fixed the retry logic.<br><br>I ran check 1 and it printed:<br><code>+it.skip('resets the backoff', ...</code><br><br>So I skipped a test instead of fixing it. The backoff still does not reset. Not ready. |

## The six checks

| #   | catches                                                                     |
| --- | --------------------------------------------------------------------------- |
| 1   | a test disabled with `.skip`, `@pytest.mark.skip`, `#[ignore]`, `@Disabled`… |
| 2   | an assertion that cannot fail, like `expect(true).toBe(true)`                |
| 3   | more assertions removed than added                                           |
| 4   | a test file deleted, or renamed out of the runner's glob                     |
| 5   | an error swallowed by an empty `catch` or `except: pass`                     |
| 6   | "I added tests" when no test file changed                                    |

Across 86,156 agent-authored test patches, [80.2% carried weak or no assertions at
all](https://arxiv.org/abs/2606.18168). Why these six: [docs/why.md](docs/why.md).

## Tune it

The commands in [`SKILL.md`](skills/verify-before-claiming/SKILL.md) are plain `git` and `grep`.
Adding a framework is one regex.

There is also an optional CLI in [`src/`](src) that runs the same checks as a CI gate, for when
you would rather not depend on the agent cooperating.

## Credits

The problem these checks exist for is measured in _All Smoke, No Alarm: Oracle Signals in
Agent-Authored Test Code_ by Dipayan Banik, Kowshik Chowdhury and Shazibul Islam Shamim, and in
METR's work on reward hacking. The checks themselves are not from those papers. They are six
things a diff can prove, cheap enough to run every turn.

## License

[MIT](LICENSE). Contributions welcome: [CONTRIBUTING.md](CONTRIBUTING.md).

Star ⭐ if it saved you one merge past one "✅ All tests pass."
