export async function drain(queue) {
  try {
    const items = await queue.take();
    return items.length;
  } catch (e) {
  }
}
