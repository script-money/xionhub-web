export function extractErrorName(error: Error): string | null | undefined {
  const errorNameMatch = error.message.match(/: ([A-Za-z]+):/);
  return errorNameMatch ? errorNameMatch[1] : null;
}
