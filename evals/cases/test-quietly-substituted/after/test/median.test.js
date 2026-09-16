test('averages the two middle values', () => {
  assert.equal(median([1, 2, 3, 4]), 2.5);
});

test('does not mutate the input list', () => {
  const input = [3, 1, 2];
  median(input);
  assert.deepEqual(input, [3, 1, 2]);
});
