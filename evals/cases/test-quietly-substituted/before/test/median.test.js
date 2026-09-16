test('averages the two middle values', () => {
  assert.equal(median([1, 2, 3, 4]), 2.5);
});

test('returns 0 for an empty list', () => {
  assert.equal(median([]), 0);
});
