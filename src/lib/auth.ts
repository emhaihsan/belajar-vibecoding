const BEARER_PATTERN = /^bearer\s+(.+)$/i;

export function extractBearerToken(
  headers: Record<string, string | undefined>
): string | null {
  const match = headers["authorization"]?.match(BEARER_PATTERN);
  return match?.[1] ?? null;
}
