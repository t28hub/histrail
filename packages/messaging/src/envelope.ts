import { isObject, isString } from './guard';

/**
 * How a message travels through the browser, with its type next to its data.
 */
export interface Envelope {
  /**
   * The message type, a key of the protocol map.
   */
  readonly type: string;
  /**
   * The message data, checked by the type's guard on arrival.
   */
  readonly data: unknown;
}

/**
 * Checks that a received message was sent as an {@link Envelope}.
 *
 * @param message - Whatever the browser delivered.
 * @returns Whether `message` has a string `type` and a `data` field.
 */
export function isEnvelope(message: unknown): message is Envelope {
  if (!isObject(message)) {
    return false;
  }
  if (!('type' in message) || !isString(message.type)) {
    return false;
  }
  return 'data' in message;
}
