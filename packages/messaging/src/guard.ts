/**
 * Checks at runtime that a value received from another context is a `T`.
 *
 * @typeParam T - The type the value must have.
 */
export type Guard<T> = (value: unknown) => value is T;

/**
 * One {@link Guard} per message type of a protocol map.
 *
 * @typeParam P - Maps each message type to the type of its data.
 */
export type ProtocolGuards<P> = { readonly [T in keyof P]: Guard<P[T]> };

/**
 * Checks that a value is a boolean.
 */
export const isBoolean: Guard<boolean> = (value): value is boolean => typeof value === 'boolean';

/**
 * Checks that a value is a number.
 */
export const isNumber: Guard<number> = (value): value is number => typeof value === 'number';

/**
 * Checks that a value is a string.
 */
export const isString: Guard<string> = (value): value is string => typeof value === 'string';

/**
 * Checks that a value is a non-null object, so its properties can be read with `in`.
 */
export const isObject: Guard<object> = (value): value is object =>
  typeof value === 'object' && value !== null;
