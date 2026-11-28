import { type Guard, isObject, isString } from '@histrail/messaging';
import type { Capture } from './types';

/**
 * `T`'s keys with values not yet checked.
 */
type Unchecked<T> = { readonly [K in keyof T]?: unknown };

/**
 * Checks that a value received from a content script is a {@link Capture}.
 */
export const isCapture: Guard<Capture> = (value): value is Capture => {
  if (!isObject(value)) {
    return false;
  }

  const capture: Unchecked<Capture> = value;
  if (!isString(capture.url)) {
    return false;
  }

  if (!isString(capture.title)) {
    return false;
  }

  if (capture.canonicalUrl !== null && !isString(capture.canonicalUrl)) {
    return false;
  }

  if (capture.lang !== null && !isString(capture.lang)) {
    return false;
  }
  return isString(capture.text);
};
