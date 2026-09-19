it('returns the item count', async () => {
  expect(await drain(fake([1, 2]))).toBe(2);
});
it('survives a take failure', async () => {
  expect(await drain(broken())).toBe(undefined);
});
