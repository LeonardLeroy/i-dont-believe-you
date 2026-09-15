## What this changes

<!-- One or two sentences. Link the issue with "Closes #123" if there is one. -->

## Checklist

- [ ] `npm test` passes
- [ ] `npm run lint` and `npm run typecheck` pass
- [ ] New or changed behaviour has a test that fires **and** a test that stays quiet
- [ ] Docs updated if the CLI surface or a check's behaviour changed

## For a new check or language profile

- [ ] Added an eval case under `evals/cases/` from a real session, if you have one
- [ ] Stated below what it will **not** catch, so reviewers know the limits

<!--
False positives are the one failure this project cannot afford. If you are unsure whether a
pattern is safe, say so here rather than widening it.
-->
