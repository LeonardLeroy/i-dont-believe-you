# Issues to create

Not tracked by the project, a staging file. Copy each block into a new GitHub issue, apply the
label above it, then delete this file once the issues exist.

---

## `good first issue`

### Cover Java test frameworks in the skill's checks

**Context.** The six commands in `skills/verify-before-claiming/SKILL.md` match patterns from
JavaScript, Python, Go, Rust and a little Java. JUnit is only partly covered: check 1 knows
`@Disabled` and `@Ignore`, but check 2 does not know `assertTrue(true)` or `assertThat(true)`
properly, and check 3 does not count `assertThat(` as an assertion.

**What to do.** Widen the regexes in checks 2 and 3 for JUnit 4 and 5. Add an eval case under
`evals/cases/` with a `before/` and `after/` tree in Java proving each one fires.

**Acceptance criteria.**

- `npm run evals` passes with the new case.
- A second case shows a legitimate Java change that fires nothing.
- The commands still run in under a second.

**Difficulty.** Easy.

---

### Cover Ruby test frameworks in the skill's checks

**Context.** RSpec and Minitest are not covered at all. `xit`, `pending`, `skip`, `assert_*` and
`expect(...).to` appear in none of the six commands.

**What to do.** Widen checks 1, 2, 3 and 4 for RSpec and Minitest, including the `spec/` path
convention in checks 4 and 6. Add eval cases both ways.

**Acceptance criteria.** Evals pass; a legitimate Ruby change fires nothing.

**Difficulty.** Easy.

---

### Cover C# test frameworks in the skill's checks

**Context.** xUnit, NUnit and MSTest are not covered. `[Fact(Skip = "...")]`, `[Ignore]`,
`Assert.*` and `Should()` appear in none of the commands.

**What to do.** Widen checks 1, 2 and 3. Add eval cases both ways.

**Acceptance criteria.** Evals pass; a legitimate C# change fires nothing.

**Difficulty.** Easy.

---

### Cover PHP test frameworks in the skill's checks

**Context.** PHPUnit and Pest are not covered beyond `markTestSkipped` in check 1.

**What to do.** Widen checks 2 and 3 for `$this->assert*` and `expect(...)->`, and add the
`tests/` and `*Test.php` conventions to checks 4 and 6.

**Acceptance criteria.** Evals pass; a legitimate PHP change fires nothing.

**Difficulty.** Easy.

---

### Add a seventh check: inline linter suppressions

**Context.** An agent that cannot satisfy the linter sometimes silences it instead. Nothing
catches that today, and it directly contradicts "the build is clean".

**What to do.** Add a `### 7.` section to `SKILL.md` with a `<!-- check: silenced-linter -->`
marker and one command detecting suppressions **added** in the diff: `eslint-disable`,
`@ts-ignore`, `@ts-expect-error`, `# noqa`, `# type: ignore`, `#[allow(...)]`, `//nolint`,
`# rubocop:disable`. Then mirror it in `src/checks/` for the CLI.

**Acceptance criteria.**

- Eval case where it fires and one where it does not.
- Stays quiet on a suppression that already existed and was only re-indented.
- `npm run sync-skill` run and the result committed.

**Difficulty.** Easy.

---

### Add a check: weakened CI configuration

**Context.** `continue-on-error: true`, a `|| true` appended to a test command, or a removed
`--ci` flag turns a red pipeline green without fixing anything.

**What to do.** New check in `SKILL.md` scanning added lines in `.github/workflows/**`,
`.gitlab-ci.yml`, `Makefile` and `package.json` scripts.

**Acceptance criteria.** Fires on each pattern, quiet on an unrelated workflow edit, eval case
included.

**Difficulty.** Easy.

---

### Upgrade vitest past the advisory chain

**Context.** `npm audit` reports five advisories, all in the `vitest` -> `vite` -> `esbuild`
chain and all devDependencies. The project has zero production dependencies, so anyone installing
the package sees none of them. The critical one requires the `vitest --ui` server, which this
project never starts.

Still worth clearing: it is the first thing a visitor runs.

**What to do.** Move `vitest` from `^2.1.8` to `^5` (4.1.11 is also patched if 5 proves painful).
`npm install -D vitest@latest` fails with `ERESOLVE` because vitest 5 wants `vite` 6 or newer as a
peer and the old tree pins vite 5, so this needs `package-lock.json` and `node_modules` removed
and a fresh install.

**Acceptance criteria.**

- `npm audit` reports zero advisories.
- All 68 tests still pass, with no change to `vitest.config.ts` beyond what the upgrade requires.
- CI passes on all three operating systems.
- The PR says what the upgrade changed, if anything, in test behaviour.

**Difficulty.** Easy to medium. The upgrade itself is quick; the risk is a vitest 5 API change in
the test files.

---

### Confirm an unverified install path

**Context.** `targets` in `src/install-skill.ts` maps an agent id to the directory it reads skills
from, and `npm run sync-skill` commits a copy under each. Only two are confirmed against the
agent's own documentation: Claude Code (`.claude/skills`) and Codex CLI (`.codex/skills`).
Cursor, opencode and the `.agents` convention were written without access to the agent and are
listed as unverified in [INSTALL.md](INSTALL.md).

**What to do.** Pick one you actually use. Confirm where it reads project-level skills from,
correct the entry if it is wrong, and move it into the verified table in `INSTALL.md`.

**Acceptance criteria.**

- The PR says which agent and version you checked, and how you confirmed it.
- The skill loads in that agent.
- `npm run sync-skill:check` passes.

**Difficulty.** Easy. No TypeScript beyond editing one array.

---

### Publish through the agent plugin marketplaces

**Context.** Installation is a `curl` today. Several agents install from a repository directly:
`claude plugin marketplace add <owner>/<repo>`, `npx skills add <owner>/<repo> -a <agent>`,
`grok plugin install`, `pi install`. Each needs a manifest at the repository root or under a
`.<agent>-plugin/` directory.

**What to do.** Add the manifests for one agent at a time. Read that agent's published schema
first. Do not infer field names from another agent's manifest.

**Acceptance criteria.**

- One agent per PR.
- The install command in the PR description works from a clean machine.
- The schema source is linked in the PR.
- `INSTALL.md` gains the command in the verified section.

**Difficulty.** Medium. The single highest-leverage thing for adoption in this list.

---

### Contribute eval cases from real sessions

**Context.** `evals/cases/` has three hand-written cases. Real ones are what keep the commands
honest as they widen.

**What to do.** For a session where your agent claimed something untrue, add
`evals/cases/<short-name>/` containing `before/`, `after/`, `claim.txt` and `expected.json`.
Redact anything private. Copy an existing case for the shape.

**Acceptance criteria.**

- `npm run evals` passes with the new case.
- If the case fails because no check catches it, open it anyway and say so. A failing case is a
  valid bug report and will be labelled as one.

**Difficulty.** Easy. No TypeScript needed.

---

### Record a terminal demo for the README

**Context.** The README describes the skill. A recording of an agent being caught by it converts
better than a table.

**What to do.** Record a session where the agent skips a test, runs the checks, and is forced to
correct itself. asciinema or a GIF under 2 MB, placed under the pitch line.

**Acceptance criteria.** Under 30 seconds, readable at GitHub's rendered width, nothing private
visible.

**Difficulty.** Easy. No code.

---

### Make the checks quiet about CRLF warnings

**Context.** On Windows with `core.autocrlf` unset, `git diff` writes "LF will be replaced by
CRLF" warnings to stderr. The agent pastes them along with the real output, which makes a silent
check look like a hit.

**What to do.** Decide whether to suppress stderr in the documented commands, or to tell the
reader to configure `core.autocrlf`. Suppressing stderr hides real git errors, so weigh both and
say why in the PR.

**Acceptance criteria.** A silent check produces genuinely empty output on Windows. Real git
failures are still visible.

**Difficulty.** Easy.

---

## `help wanted`

### Shorten the skill without losing its teeth

**Context.** `SKILL.md` is the product, and every token of it competes for the agent's attention.
It is currently around 120 lines. Agents follow short, imperative instructions better than long
ones.

**What to do.** Cut it down while keeping all six commands, the refusal rules and the citations.
Measure the result: run the evals and, if you can, compare agent compliance before and after on
the same session.

**Acceptance criteria.**

- Evals still pass.
- The PR reports what was cut and why it was safe to cut.
- The "Never" section stays intact. It is the part that stops the skill being talked out of.

**Difficulty.** Medium.

---

### Measure whether agents actually obey the skill

**Context.** The evals prove the commands catch what they claim. Nothing proves an agent that has
the skill installed actually runs them. That gap is the project's central weakness and it should
be measured, not assumed.

**What to do.** Build a harness that runs a fixed task against an agent twice, with and without
the skill, and records whether the checks were run and whether a false success was reported.

**Acceptance criteria.**

- Reproducible by someone else with the same agent.
- Results published in the repository, including a negative result if that is what comes out.
- Documented cost per run.

**Difficulty.** Hard. Discuss the design in the issue before writing code.

---

### Package as an Agent Plugin v1.0.0

**Context.** The skill installs by copying a file. The Agent Plugins v1.0.0 specification is a
portable packaging format across several clients.

**What to do.** Add the manifest the spec requires and validate the package against the canonical
JSON schema in CI. Read the specification first. Do not infer the field names.

**Acceptance criteria.**

- Validates against the published v1.0.0 schema, checked in CI.
- Installation verified on at least two clients, named in the PR.
- README gains a one-line install command.

**Difficulty.** Medium.

---

### A pre-commit hook that runs the six checks

**Context.** The skill constrains an agent that cooperates. A hook constrains everything.

**What to do.** A `.pre-commit-hooks.yaml` entry plus a shell script that runs the same commands
the skill documents, extracting them from `SKILL.md` so the two cannot drift.

**Acceptance criteria.** Works from a clean clone; documented in README; the script fails loudly
if `SKILL.md` has a bash block with no marker.

**Difficulty.** Medium.

---

### GitHub Action that comments on the pull request

**Context.** The CLI exits non-zero. A reviewer reading a PR sees nothing unless they open the
logs.

**What to do.** An `action.yml` plus a thin wrapper that runs the checks against the PR range and
posts one collapsible comment, updating it in place on re-runs.

**Acceptance criteria.**

- Uses `GITHUB_TOKEN` with `pull-requests: write` and nothing else.
- Updates its existing comment instead of posting duplicates.
- A `fail-on` input chooses between commenting only and failing the check.

**Difficulty.** Medium.

---

### Adapter for Claude Code session transcripts

**Context.** The optional CLI reads transcripts through `src/adapters/jsonl.ts`, which walks any
JSONL for assistant text. It is a guess at the real shape and cannot tell a final summary from
intermediate thinking, and only the summary is a claim to the user.

**What to do.** `src/adapters/claude-code.ts` targeting the real on-disk format, registered ahead
of the generic adapter.

**Acceptance criteria.** Redacted fixture in `tests/`, `detect()` returns false for other agents,
tool results are not treated as claims.

**Difficulty.** Medium. Requires access to the agent.

---

### Adapter for Codex CLI

**Context.** As above, for Codex CLI's session log.

**Acceptance criteria.** Redacted fixture, non-colliding `detect()`, tests.

**Difficulty.** Medium.

---

### SARIF output for the CLI

**Context.** `src/report/` has terminal and JSON. SARIF would surface findings in GitHub code
scanning and in IDEs with no extra integration.

**What to do.** `src/report/sarif.ts` emitting SARIF 2.1.0, one rule per check. Add
`--format sarif`.

**Acceptance criteria.** Validates against the SARIF 2.1.0 schema in a test; severity mapping
documented; `--json` unchanged.

**Difficulty.** Medium.

---

## `enhancement`

### Keep the skill and the CLI provably in sync

**Context.** The six commands live in `SKILL.md` and are reimplemented in `src/checks/`. They can
drift, and a drift means the CI gate and the agent disagree about what is wrong.

**What to do.** Add a test that runs both against every eval case and asserts they agree on which
checks fire.

**Acceptance criteria.**

- Fails when a check exists on one side only.
- The PR documents any disagreement that is deliberate, with the reason.

**Difficulty.** Medium. High value: it removes the main structural risk in the repo.

---

### Detect weakened assertions

**Context.** Check 3 counts assertions. It cannot see an assertion that survived but stopped
meaning anything: `toBe(42)` becoming `toBeDefined()`, `assertEqual` becoming `assertIsNotNone`,
`assert_eq!` becoming `assert!`.

**What to do.** A check comparing assertion strength between removed and added lines, using a
documented per-language ranking.

**Acceptance criteria.** Fires when strength drops, quiet on an unrelated rewrite, ranking
documented, eval case included.

**Difficulty.** Hard. Discuss the design first.

---

### Compare assertions per test rather than per file

**Context.** Known limitation. Check 3 compares totals across the whole diff, so deleting a
thorough test and adding a shallow one nets out to zero and goes unreported.

**What to do.** Attribute added and removed lines to the enclosing test, then compare per test.
This is probably beyond one shell command, so it may belong to the CLI only. Say so if that is
your conclusion.

**Acceptance criteria.** Fires on delete-one-add-one where assertions drop, quiet on a genuine
refactor.

**Difficulty.** Hard.

---

### Verify claims about commands that were run

**Context.** Agents often write "I ran the test suite and it passed". Nothing checks whether a
test command was ever executed.

**What to do.** Extend the CLI's adapters to surface executed commands from the transcript, then
add a check that fires when a `tests-pass` claim exists and no test command appears.

**Acceptance criteria.** Degrades silently to no finding when the adapter cannot supply commands,
rather than firing wrongly. Tests cover both paths.

**Difficulty.** Hard. Depends on a real adapter landing first.

---

### Baseline file so existing debt does not block adoption

**Context.** Pointing the CLI at a mature repository can produce many findings at once, and a team
whose first run is a wall of red will turn it off.

**What to do.** `--baseline <file>` writing current findings, with later runs reporting only what
is new.

**Acceptance criteria.** Baseline entries match on content rather than line numbers; a documented
command regenerates it; tests cover a new, a resolved and a moved finding.

**Difficulty.** Medium.

---

### Raise the evidence cap and make it per-file

**Context.** Known limitation. `MAX_EVIDENCE` in `src/checks/util.ts` caps at 20 and `scan()`
returns as soon as it hits the cap, so one noisy file can hide every other file's findings.

**What to do.** Per-file cap, higher global cap, and report how many findings were truncated.

**Acceptance criteria.** Later files still appear when an early file is noisy; the truncation
count shows in both reporters.

**Difficulty.** Easy-medium.

---

### Config file for enabling checks and setting severity

**Context.** `--only` and `--skip` are per-invocation. Teams need this in the repository.

**What to do.** Read `i-dont-believe-you` from `package.json` or `.idbyrc.json`: enabled checks,
per-check severity, path ignore globs. Flags win over the file.

**Acceptance criteria.** Documented precedence; an unknown key is an error, not silently ignored;
tests per precedence level.

**Difficulty.** Medium.

---

## `bug`

### Check 5 misses a multi-line empty catch

**Context.** Check 5 in `SKILL.md` is line-based, so it only sees an empty `catch` when both
braces land on the same line. Verified: `} catch (e) {}` fires, and so does
`} catch (e) {} finally { ... }`, but the formatted equivalent

```js
} catch (e) {
}
```

does not. Most formatters produce the second form, so the check misses a common case. This is a
miss, not a false positive, but it makes check 5 the weakest of the six.

**What to do.** Find a way to catch the multi-line form with plain `grep`. `grep -A1` over the
diff is one route, but confirm it does not break when the two lines land in different hunks.
Whatever you land, keep it a single command with no new dependency, and keep it silent on a
`catch` block that has a real body.

**Acceptance criteria.**

- An eval case with a multi-line empty catch that fires.
- The existing `error-swallowed-in-source` case still fires.
- A `catch` block with a body still fires nothing.

**Difficulty.** Medium. Harder than it looks, because line-based tools do not see across lines.

---

### `.only` is reported as a skip

**Context.** Check 1 and the CLI's `skipped-tests` both treat `.only` as a skip marker. Focusing a
test does skip every other test in the file, so it is worth reporting, but calling it
"a test was skipped" misdescribes what happened and reads as a false positive.

**What to do.** Give it its own check and its own wording, in both `SKILL.md` and `src/checks/`.

**Acceptance criteria.** `.only` produces a finding that names focusing rather than skipping.
Existing skip cases unaffected.

**Difficulty.** Easy.

---

### `toBeDefined()` flagged as a hollow assertion by the CLI

**Context.** The JavaScript `hollowAssertion` pattern in `src/lang/registry.ts` matches a trailing
`expect(x).toBeDefined()`. That is a weak assertion, not a tautological one. It fails when `x` is
undefined. Reporting it as an assertion that "passes regardless of the code under test" is
inaccurate. The skill's check 2 does not have this problem, so the two disagree.

**What to do.** Remove it from `hollowAssertion` and, if it is worth reporting, fold it into the
weakened-assertions work.

**Acceptance criteria.** `expect(x).toBeDefined()` no longer produces a hollow-assertion finding;
`expect(true).toBe(true)` still does; a test pins both.

**Difficulty.** Easy.

---

### `no-tests-touched` fires on an empty diff

**Context.** With a `tests-added` claim and an empty diff, the CLI reports "0 file(s) changed,
none of them tests". Defensible, but confusing, and an empty diff usually means the wrong
`--range` was passed.

**What to do.** Warn that nothing was compared and skip the checks rather than reporting findings
against nothing.

**Acceptance criteria.** An empty diff produces a distinct message and exit code `0`, with a hint
about `--range`.

**Difficulty.** Easy.

---

### Check 4 misses a rename when git reports it as a rename

**Context.** `git diff HEAD --diff-filter=DR --name-status` was verified against a staged delete
and against a staged rename that git reported as `D` plus `A`. It has not been verified against a
case where git actually emits `R100 old new`, which is what happens once similarity detection
kicks in.

**What to do.** Build that case, confirm the grep matches the `R` line, and add it to the evals.

**Acceptance criteria.** An eval case where git emits an `R` status and check 4 fires.

**Difficulty.** Easy.

---

## `documentation`

### A page documenting every check

**Context.** The checks are discoverable only by reading `SKILL.md` end to end.

**What to do.** `docs/checks.md` with, per check: what it looks for, a diff that makes it fire, a
diff that looks similar but must not, and which claim it contradicts. Link it from the README.

**Acceptance criteria.** Every check has an entry, and the examples are taken from real eval cases
so they cannot drift.

**Difficulty.** Easy.

---

### A guide to widening a check for a new language

**Context.** Four of the easy issues above are the same task in different languages. A short guide
turns each into a half-hour contribution.

**What to do.** `docs/adding-a-language.md` walking through one command, the eval case format, and
the two-cases-per-change rule.

**Acceptance criteria.** Someone who has not read the repository can follow it end to end. Linked
from CONTRIBUTING.

**Difficulty.** Easy.

---

### An honest comparison with adjacent tools

**Context.** Vendor-native verification features and other test-integrity scanners solve
overlapping problems differently. Users deserve to know when this is the wrong tool.

**What to do.** `docs/alternatives.md` covering what each neighbour does, what this does
differently, and the cases where one of the others is the better choice.

**Acceptance criteria.** No disparagement, no straw men, and at least one case where the honest
recommendation is a different tool.

**Difficulty.** Easy.

---

### Translate the README

**Context.** `README.md` (English) sits at the repository root. Translations live in
`.github/readme/README.<lang>.md`, and every README carries a language switcher under the badges. Chinese, Japanese and Korean were deliberately left out
rather than shipped at a quality nobody in the project could verify.

**Wanted**, roughly in order of audience size: Simplified Chinese (`README.zh-CN.md`), Japanese
(`README.ja.md`), Korean (`README.ko.md`), Brazilian Portuguese (`README.pt-BR.md`), German
(`README.de.md`), Russian (`README.ru.md`), Hindi (`README.hi.md`).

**What to do.** Translate into a language you actually speak. Copy `README.md` into
`.github/readme/`, keep the structure, fix the relative links (they drop two levels), and add
your language to the switcher in **every** existing README.

**Acceptance criteria.**

- Research citations keep their original English titles and links.
- Command blocks, file paths and the sample check output stay unchanged: that is what the tool
  prints.
- `SKILL.md` itself stays in English. It is read by the agent, not by a person.
- The switcher is updated in every README, not only yours.
- Say in the PR whether you are a native speaker.

**Difficulty.** Easy.
