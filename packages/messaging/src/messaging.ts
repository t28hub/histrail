import { type Envelope, isEnvelope } from './envelope';
import type { ProtocolGuards } from './guard';
import type { Runtime, RuntimeMessageSender } from './runtime';
import { type MessageSender, toMessageSender } from './sender';

/**
 * Receives the validated data of one message type.
 *
 * @typeParam D - The type of the message data.
 * @param data - The message data, already checked by its guard.
 * @param sender - Who sent the message.
 */
export type MessageHandler<D> = (data: D, sender: MessageSender) => void;

/**
 * Runtime messaging within the extension, without responses.
 *
 * @typeParam P - Maps each message type to the type of its data.
 */
export interface Messaging<P> {
  /**
   * Sends a message to the rest of the extension.
   *
   * @typeParam T - The message type.
   * @param type - The message type.
   * @param data - The message data, serializable by the browser.
   * @returns Resolves once the message is delivered.
   * @throws When nothing listens, or the sender's context was invalidated by a reload.
   */
  sendMessage<T extends keyof P & string>(type: T, data: P[T]): Promise<void>;

  /**
   * Calls `handler` for each message of `type` from this extension whose sender and data are valid.
   *
   * @typeParam T - The message type.
   * @param type - The message type to handle.
   * @param handler - Called with each matching message.
   * @returns A function that removes `handler`.
   */
  onMessage<T extends keyof P & string>(type: T, handler: MessageHandler<P[T]>): () => void;
}

/**
 * Creates runtime messaging typed by a protocol map.
 *
 * @typeParam P - Maps each message type to the type of its data.
 * @param runtime - The browser's runtime API, such as `browser.runtime`.
 * @param guards - Checks the data of each message type before it reaches a handler.
 * @returns Functions that send and handle the messages of `P`.
 * @example defineMessaging<{ greet: Greeting }>(browser.runtime, { greet: isGreeting });
 */
export function defineMessaging<P extends object>(
  runtime: Runtime,
  guards: ProtocolGuards<P>,
): Messaging<P> {
  return {
    async sendMessage(type, data) {
      const envelope: Envelope = { type, data };
      await runtime.sendMessage(envelope);
    },

    onMessage(type, handler) {
      const guard = guards[type];
      const listener = (message: unknown, sender: RuntimeMessageSender) => {
        // Other types and foreign messages are routine, so they are skipped without logging.
        if (!isEnvelope(message) || message.type !== type) {
          return;
        }

        const from = toMessageSender(sender);
        if (from === undefined) {
          console.debug('message dropped: unidentifiable sender');
          return;
        }
        if (from.extensionId !== runtime.id) {
          console.debug('message dropped: another extension');
          return;
        }

        const { data } = message;
        if (!guard(data)) {
          console.debug('message dropped: malformed data', type);
          return;
        }
        handler(data, from);
      };

      runtime.onMessage.addListener(listener);
      return () => runtime.onMessage.removeListener(listener);
    },
  };
}
