import { defineMessaging } from '@histrail/messaging';
import { isCapture } from './capture/guard';
import type { Capture } from './capture/types';
import { runtime } from './platform/runtime';

/**
 * Maps each message type in the extension to the type of its data.
 *
 * One map covers the whole extension, so two features can't reuse a message type.
 */
interface ProtocolMap {
  /**
   * A content script sends the text of the page it runs in to the background.
   */
  readonly capture: Capture;
}

export const { sendMessage, onMessage } = defineMessaging<ProtocolMap>(runtime, {
  capture: isCapture,
});
