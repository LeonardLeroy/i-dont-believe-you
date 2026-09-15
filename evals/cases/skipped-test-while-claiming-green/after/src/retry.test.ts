it.skip('resets the backoff between attempts', async () => {
  expect(await backoffFor(3)).toBe(800);
});
it('gives up after the cap', async () => {
  expect(await backoffFor(99)).toBe(MAX);
});
