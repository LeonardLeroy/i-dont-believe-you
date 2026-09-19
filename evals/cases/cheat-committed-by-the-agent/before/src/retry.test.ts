it('resets the backoff after a success', () => {
  expect(retry(succeed).backoff).toBe(0);
});
