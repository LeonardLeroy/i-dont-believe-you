it('decodes a valid token', () => {
  expect(parse(valid()).sub).toBe('u1');
});
