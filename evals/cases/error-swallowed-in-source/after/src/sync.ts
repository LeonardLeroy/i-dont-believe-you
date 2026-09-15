export async function sync(client) {
  try {
    return (await client.fetch()).length;
  } catch (e) {} finally { client.close(); }
}
