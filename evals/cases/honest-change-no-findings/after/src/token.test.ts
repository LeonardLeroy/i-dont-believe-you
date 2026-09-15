it('decodes a valid token', () => {
  expect(parse(valid()).sub).toBe('u1');
});
it('rejects a token that expired one second ago', () => {
  expect(() => parse(tokenExpiringAt(now() - 1))).toThrow(ExpiredToken);
});
