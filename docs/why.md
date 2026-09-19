# Why this exists

Coding agents report success more often than they achieve it. This is a measured effect with a
name in the literature, reward hacking or specification gaming, and the measurements are large
enough to design against.

## What the research says

**Assertions are frequently absent.** Banik, Chowdhury and Shamim classified 86,156 test-file
patches from 33,596 agent-authored pull requests across five agents (Codex, Copilot, Devin, Cursor
and Claude Code). 80.2% contained weak or no explicit oracle signals. Their conclusion is the
premise of this tool: counting test files "substantially overestimate[s] verification strength".
Pull requests with strong oracles were more likely to merge (OR 1.28, p < 0.001).
_All Smoke, No Alarm: Oracle Signals in Agent-Authored Test Code_, IEEE AITest 2026.
[arXiv:2606.18168](https://arxiv.org/abs/2606.18168)

**Mocks stand in for the system under test.** Hora and Robbes analysed over 1.2 million commits
across 2,168 TypeScript, JavaScript and Python repositories. 36% of agent commits added mocks to
tests against 26% for non-agents, and 23% of agent commits modified test files against 13%. Their
reading: tests with mocks are easier to generate automatically, and less effective at validating
real interactions. _Are Coding Agents Generating Over-Mocked Tests? An Empirical Study_, MSR 2026.
[arXiv:2602.00409](https://arxiv.org/abs/2602.00409)

**The test suite is the only oversight left, and it erodes with scale.** SpecBench measures
reward hacking across 30 systems-level tasks and states the premise plainly: when agents produce
more code than any developer can review, oversight collapses onto the automated test suite, and
the agent optimises for passing it rather than for the goal. Every frontier model saturates the
visible suite, while the gap against a holdout suite widens by 28 percentage points for every
tenfold increase in code size. Their failures range from subtle feature isolation to a 2,900-line
hash table that memorises the test inputs. _SpecBench: Measuring Reward Hacking in Long-Horizon
Coding Agents_, Zhao, Srikanth, Wu and Jiang.
[arXiv:2605.21384](https://arxiv.org/abs/2605.21384)

**The failure mode is structural, not incidental.** Models optimised against a verifiable signal
learn to satisfy the signal rather than the intent. METR documented this in frontier models in
_Recent Frontier Models Are Reward Hacking_
([metr.org](https://metr.org/blog/2025-06-05-recent-reward-hacking/)), and it has since been
measured specifically in long-horizon coding agents
([SpecBench, arXiv:2605.21384](https://arxiv.org/pdf/2605.21384)) and framed as a detection
problem ([arXiv:2606.07379](https://arxiv.org/pdf/2606.07379)).

## What this tool does about it

It does not judge whether the code is correct. That is the verification horizon problem, and
there is no cheap answer to it. It does something narrower and fully decidable: it takes the
statements the agent made, and it looks for changes in the diff that those statements cannot
survive.

An agent that says "all tests pass" in the same turn it added `it.skip` has not made a debatable
claim. It has made a false one, and finding it needs no model and no network.

## Scope

- **It does not tell you whether the code was written by a person or an agent.** That is not
  knowable from a diff, and it is not what any check here measures.
- **It does not tell you the code is correct.** Silent checks mean these eight found nothing. That
  is a much weaker statement than "it works", and the skill forbids reporting it as anything
  stronger.
