import type { MessageSender } from '@histrail/messaging';
import { parseHttpUrl } from './url';

/**
 * Why {@link checkCaptureSender} rejected the sender of a capture.
 */
export type Rejection =
  /**
   * The sender is an extension page, not a content script in a tab.
   */
  | 'not-content-script'
  /**
   * The sender runs in a subframe, not the tab's top-level frame.
   */
  | 'not-top-frame'
  /**
   * The tab is in a private window.
   */
  | 'incognito'
  /**
   * The tab's page is not HTTP or HTTPS.
   */
  | 'unsupported-url';

/**
 * Checks that a capture came from a content script in a top-level frame.
 *
 * @param sender - Who sent the capture, already known to be this extension.
 * @returns The first reason the sender is rejected, or `null` when it is accepted.
 */
export function checkCaptureSender(sender: MessageSender): Rejection | null {
  if (sender.kind !== 'tab') {
    return 'not-content-script';
  }
  if (sender.frameId !== 0) {
    return 'not-top-frame';
  }
  if (sender.incognito) {
    return 'incognito';
  }
  if (parseHttpUrl(sender.url) === null) {
    return 'unsupported-url';
  }
  return null;
}
