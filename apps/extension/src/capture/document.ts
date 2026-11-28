import type { Capture } from './types';
import { parseHttpUrl } from './url';

/**
 * Captures the text the user sees in `document` at this moment.
 *
 * @param document - The rendered document.
 * @returns The capture.
 */
export function captureDocument(document: Document): Capture {
  return {
    // Always HTTP or HTTPS, since the content script matches only those and pushState keeps the scheme.
    url: document.URL,
    title: document.title,
    canonicalUrl: findCanonicalUrl(document),
    lang: document.documentElement.lang || null,
    // biome-ignore lint/performance/useDomNodeTextContent: capture the text the user saw, not hidden text.
    text: document.body?.innerText ?? '',
  };
}

/**
 * Finds the page's canonical URL.
 *
 * @param document - The rendered document.
 * @returns The absolute HTTP or HTTPS URL in `<link rel="canonical">`, or `null` when there is none.
 */
function findCanonicalUrl(document: Document): string | null {
  // Only <head> counts, as for search engines, and SVG documents have none.
  const link = document.head?.querySelector<HTMLLinkElement>('link[rel~="canonical" i]');
  if (!link) {
    return null;
  }

  // Other schemes such as `javascript:` and `data:` name no page, and `data:` has no length bound.
  return parseHttpUrl(link.href)?.href ?? null;
}
