import type { Runtime } from '@histrail/messaging';
import { browser } from 'wxt/browser';

/**
 * The browser's runtime API, for {@link defineMessaging} in `@histrail/messaging`.
 */
export const runtime: Runtime = browser.runtime;
