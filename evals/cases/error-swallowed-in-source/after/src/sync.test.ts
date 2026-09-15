it('returns the row count', async () => {
  expect(await sync(fake([1, 2]))).toBe(2);
});
it('survives a fetch failure', async () => {
  expect(await sync(broken())).toBe(undefined);
});
