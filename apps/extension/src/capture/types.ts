// Moves to crates/protocol once `just gen` exists, so keep every field plain JSON.

/**
 * The text of a page as the user saw it, captured by a content script.
 */
export interface Capture {
  /**
   * The page's URL at capture time.
   */
  readonly url: string;
  /**
   * The page's title at capture time.
   */
  readonly title: string;
  /**
   * The absolute HTTP or HTTPS URL in `<head>`'s `<link rel="canonical">`, or `null` when there is none.
   */
  readonly canonicalUrl: string | null;
  /**
   * The `lang` attribute of `<html>` as the page wrote it, or `null` when it is missing or empty.
   */
  readonly lang: string | null;
  /**
   * `document.body.innerText`.
   */
  readonly text: string;
}
