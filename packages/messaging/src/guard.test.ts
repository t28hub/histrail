import { describe, expect, it } from 'vitest';
import { isBoolean, isNumber, isObject, isString } from './guard';

describe('isBoolean', () => {
  it.each([true, false])('accepts %o', (value) => {
    // Act
    const actual = isBoolean(value);

    // Assert
    expect(actual).toBe(true);
  });

  it.each([null, undefined, 0, 'true', {}, new Boolean(true)])('rejects %o', (value) => {
    // Act
    const actual = isBoolean(value);

    // Assert
    expect(actual).toBe(false);
  });
});

describe('isNumber', () => {
  it.each([0, 1.5, Number.NaN])('accepts %o', (value) => {
    // Act
    const actual = isNumber(value);

    // Assert
    expect(actual).toBe(true);
  });

  it.each([null, undefined, '1', true, {}, new Number(1)])('rejects %o', (value) => {
    // Act
    const actual = isNumber(value);

    // Assert
    expect(actual).toBe(false);
  });
});

describe('isString', () => {
  it.each(['', 'a'])('accepts %o', (value) => {
    // Act
    const actual = isString(value);

    // Assert
    expect(actual).toBe(true);
  });

  it.each([null, undefined, 1, true, {}, new String('a')])('rejects %o', (value) => {
    // Act
    const actual = isString(value);

    // Assert
    expect(actual).toBe(false);
  });
});

describe('isObject', () => {
  it.each([{}, [], new Date(), new String('a')])('accepts %o', (value) => {
    // Act
    const actual = isObject(value);

    // Assert
    expect(actual).toBe(true);
  });

  it.each([null, undefined, 'a', 1, true])('rejects %o', (value) => {
    // Act
    const actual = isObject(value);

    // Assert
    expect(actual).toBe(false);
  });
});
