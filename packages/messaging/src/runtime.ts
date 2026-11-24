/**
 * The parts of the browser's `runtime.MessageSender` this package reads.
 */
export interface RuntimeMessageSender {
  /**
   * The ID of the sending extension.
   */
  readonly id?: string | undefined;
  /**
   * The URL of the sending page or frame.
   */
  readonly url?: string | undefined;
  /**
   * The sending frame, set only when `tab` is.
   */
  readonly frameId?: number | undefined;
  /**
   * The tab the sender runs in, if any.
   */
  readonly tab?:
    | {
        /**
         * The tab's ID, missing or `TAB_ID_NONE` for some windows.
         */
        readonly id?: number | undefined;
        /**
         * Whether the tab is in a private window.
         */
        readonly incognito: boolean;
      }
    | undefined;
}

/**
 * A listener for the browser's `runtime.onMessage`.
 *
 * @param message - Whatever another context sent.
 * @param sender - Who sent it, as the browser reports.
 */
export type RuntimeListener = (message: unknown, sender: RuntimeMessageSender) => void;

/**
 * The parts of the browser's `runtime` API this package uses, such as `browser.runtime`.
 */
export interface Runtime {
  /**
   * Sends `message` to the rest of the extension.
   *
   * @param message - The message, serializable by the browser.
   * @returns Resolves with a response, which this package ignores.
   */
  sendMessage(message: unknown): Promise<unknown>;

  /**
   * Messages from the rest of the extension.
   */
  readonly onMessage: {
    /**
     * Starts calling `listener` for each message.
     */
    addListener(listener: RuntimeListener): void;
    /**
     * Stops calling `listener`.
     */
    removeListener(listener: RuntimeListener): void;
  };
}
