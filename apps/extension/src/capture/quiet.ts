/**
 * Options for {@link waitForDomQuiet}.
 */
export interface DomQuietOptions {
  /**
   * Milliseconds the DOM must stay unchanged.
   */
  readonly quietMs: number;
  /**
   * Longest wait in milliseconds, for pages that never stop changing.
   */
  readonly maxMs: number;
  /**
   * Cancels the wait.
   */
  readonly signal?: AbortSignal;
}

/**
 * Waits until the DOM under `target` stops changing.
 *
 * @param target - The node whose subtree is observed.
 * @param options - How long to wait, and what cancels it.
 * @returns Resolves after `quietMs` without mutations, or after `maxMs` at the latest.
 * @throws Rejects with the signal's reason when aborted.
 */
export function waitForDomQuiet(
  target: Node,
  { quietMs, maxMs, signal }: DomQuietOptions,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    let quietTimer = setTimeout(finish, quietMs);
    const maxTimer = setTimeout(finish, maxMs);
    const observer = new MutationObserver(() => {
      clearTimeout(quietTimer);
      quietTimer = setTimeout(finish, quietMs);
    });
    // Attributes are left out, since carousels and animations change them without changing the text.
    observer.observe(target, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    const onAbort = () => {
      cleanup();
      reject(signal?.reason);
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    function cleanup() {
      observer.disconnect();
      clearTimeout(quietTimer);
      clearTimeout(maxTimer);
      signal?.removeEventListener('abort', onAbort);
    }

    function finish() {
      cleanup();
      resolve();
    }
  });
}
