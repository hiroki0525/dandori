export function checkApiKey(
  keyName: string,
  targetKey?: string,
  alternativeKey?: string | undefined | null,
): string {
  if (targetKey) {
    return targetKey;
  }
  if (alternativeKey) {
    return alternativeKey;
  }
  throw new Error(`Please set ${keyName}.`);
}
