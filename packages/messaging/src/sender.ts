import type { Brand } from './brand';
import type { RuntimeMessageSender } from './runtime';

/**
 * The ID the browser assigned to an extension.
 */
export type ExtensionId = Brand<string, 'ExtensionId'>;

/**
 * The ID of a tab, unique within a browser session.
 */
export type TabId = Brand<number, 'TabId'>;

/**
 * A script in a tab, such as a content script or an extension page opened in a tab.
 */
export interface TabSender {
  /**
   * Marks a sender in a tab.
   */
  readonly kind: 'tab';
  /**
   * The extension the script belongs to.
   */
  readonly extensionId: ExtensionId;
  /**
   * The tab the script runs in.
   */
  readonly tabId: TabId;
  /**
   * 0 for the top-level frame, positive for child frames.
   */
  readonly frameId: number;
  /**
   * Whether the tab is in a private window.
   */
  readonly incognito: boolean;
  /**
   * The sending frame's URL, not necessarily the tab's.
   */
  readonly url: string;
}

/**
 * An extension page outside any tab, such as a popup or an offscreen document.
 */
export interface ExtensionPageSender {
  /**
   * Marks an extension page outside any tab.
   */
  readonly kind: 'extension-page';
  /**
   * The extension the page belongs to.
   */
  readonly extensionId: ExtensionId;
  /**
   * The page's URL.
   */
  readonly url: string;
}

/**
 * Who sent a message, independent of the browser.
 */
export type MessageSender = TabSender | ExtensionPageSender;

/**
 * `chrome.tabs.TAB_ID_NONE`, the tab ID of devtools and app windows.
 */
const TAB_ID_NONE = -1;

/**
 * Converts the browser's sender into a {@link MessageSender}.
 *
 * @param sender - The sender the browser passed to `runtime.onMessage`.
 * @returns `undefined` without an ID or URL, or for a tab without a usable ID such as devtools.
 */
export function toMessageSender(sender: RuntimeMessageSender): MessageSender | undefined {
  const { id, url, tab, frameId } = sender;
  if (id === undefined || url === undefined) {
    return undefined;
  }

  const extensionId = id as ExtensionId;
  if (tab === undefined) {
    return { kind: 'extension-page', extensionId, url };
  }
  if (tab.id === undefined || tab.id === TAB_ID_NONE || frameId === undefined) {
    return undefined;
  }

  return {
    kind: 'tab',
    extensionId,
    tabId: tab.id as TabId,
    frameId,
    incognito: tab.incognito,
    url,
  };
}
