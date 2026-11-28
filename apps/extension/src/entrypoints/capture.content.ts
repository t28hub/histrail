import { defineContentScript } from 'wxt/utils/define-content-script';
import { captureDocument } from '../capture/document';
import { waitForDomQuiet } from '../capture/quiet';
import { isSamePage } from '../capture/url';
import { sendMessage } from '../messages';

const QUIET_MS = 1_000;
const MAX_WAIT_MS = 10_000;

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  runAt: 'document_idle',
  main(ctx) {
    let pending: AbortController | undefined;

    const scheduleCapture = async () => {
      // A newer navigation supersedes a capture still waiting for the DOM to go quiet.
      pending?.abort();
      pending = new AbortController();
      const signal = AbortSignal.any([pending.signal, ctx.signal]);

      try {
        await waitForDomQuiet(document.documentElement, {
          quietMs: QUIET_MS,
          maxMs: MAX_WAIT_MS,
          signal,
        });
        await sendMessage('capture', captureDocument(document));
      } catch {
        // Aborted, or the background is gone after an extension reload.
      }
    };

    void scheduleCapture();

    // SPA route changes don't reload the content script.
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl, oldUrl }) => {
      // Moving to an anchor keeps the same page and its text.
      if (isSamePage(newUrl, oldUrl)) {
        return;
      }
      void scheduleCapture();
    });
  },
});
