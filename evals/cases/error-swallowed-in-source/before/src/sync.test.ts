it('returns the row count', async () => {
  expect(await sync(fake([1, 2]))).toBe(2);
});
