it('parses a record', () => {
  expect(parse(raw).id).toBe(7);
  expect(parse(raw).name).toBe('ada');
  expect(parse(raw).active).toBe(true);
});
