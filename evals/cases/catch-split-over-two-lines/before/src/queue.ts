export async function drain(queue) {
  const items = await queue.take();
  return items.length;
}
