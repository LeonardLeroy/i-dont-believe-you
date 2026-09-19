import type { Check } from '../types.js';
import { deletedTests } from './deleted-tests.js';
import { focusedTests } from './focused-tests.js';
import { hollowAssertions } from './hollow-assertions.js';
import { leftoverStubs } from './leftover-stubs.js';
import { mockSmuggling } from './mock-smuggling.js';
import { noTestsTouched } from './no-tests-touched.js';
import { removedAssertions } from './removed-assertions.js';
import { skippedTests } from './skipped-tests.js';
import { swallowedErrors } from './swallowed-errors.js';

export const checks: Check[] = [
  skippedTests,
  focusedTests,
  hollowAssertions,
  removedAssertions,
  deletedTests,
  mockSmuggling,
  noTestsTouched,
  swallowedErrors,
  leftoverStubs,
];

export function checkById(id: string): Check | undefined {
  return checks.find((check) => check.id === id);
}

export {
  deletedTests,
  focusedTests,
  hollowAssertions,
  leftoverStubs,
  mockSmuggling,
  noTestsTouched,
  removedAssertions,
  skippedTests,
  swallowedErrors,
};
