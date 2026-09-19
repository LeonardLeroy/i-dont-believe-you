it.only('adds an item', () => {
  expect(cart.add(item).size).toBe(1);
});
it('removes an item', () => {
  expect(cart.remove(item).size).toBe(0);
});
