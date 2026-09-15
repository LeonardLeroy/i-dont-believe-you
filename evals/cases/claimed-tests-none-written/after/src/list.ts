export async function list(req) {
  const cursor = req.query.cursor ?? null;
  const limit = Number(req.query.limit ?? 50);
  return repo.page(cursor, limit);
}
