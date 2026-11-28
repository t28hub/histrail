/**
 * Parses `value` as an HTTP or HTTPS URL.
 *
 * @param value - The string to parse.
 * @returns The parsed URL, or `null` when it is not an absolute HTTP or HTTPS URL.
 */
export function parseHttpUrl(value: string): URL | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return null;
  }
  return url;
}

/**
 * Checks whether two URLs name the same page, ignoring the fragment.
 *
 * @param a - One URL.
 * @param b - The other URL.
 * @returns `true` when the URLs differ at most in the fragment.
 */
export function isSamePage(a: URL, b: URL): boolean {
  return withoutHash(a) === withoutHash(b);
}

function withoutHash(url: URL): string {
  const copy = new URL(url);
  copy.hash = '';
  return copy.href;
}
