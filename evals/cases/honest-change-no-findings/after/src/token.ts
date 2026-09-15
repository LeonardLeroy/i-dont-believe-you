export function parse(raw) {
  const payload = decode(raw);
  if (payload.exp <= now()) throw new ExpiredToken(payload.exp);
  return payload;
}
