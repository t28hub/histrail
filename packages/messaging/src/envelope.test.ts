import { describe, expect, it } from 'vitest';
import { isEnvelope } from './envelope';

describe('isEnvelope', () => {
  it('accepts a type with data', () => {
    // Act
    const actual = isEnvelope({
      type: 'greet',
      data: {
        name: 'Alice',
      },
    });

    // Assert
    expect(actual).toBe(true);
  });

  it('accepts data that is undefined', () => {
    // Act
    const actual = isEnvelope({ type: 'greet', data: undefined });

    // Assert
    expect(actual).toBe(true);
  });

  it.each([
    ['a non-object', 'greet'],
    ['null', null],
    ['a missing type', { data: 1 }],
    ['a non-string type', { type: 1, data: 1 }],
    ['missing data', { type: 'greet' }],
  ])('rejects %s', (_, message) => {
    // Act
    const actual = isEnvelope(message);

    // Assert
    expect(actual).toBe(false);
  });
});
