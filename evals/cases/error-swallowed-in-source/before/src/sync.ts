export async function sync(client) {
  const rows = await client.fetch();
  return rows.length;
}
