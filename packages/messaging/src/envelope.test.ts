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
    { name: 'a non-object', message: 'greet' },
    { name: 'null', message: null },
    { name: 'a missing type', message: { data: 1 } },
    { name: 'a non-string type', message: { type: 1, data: 1 } },
    { name: 'missing data', message: { type: 'greet' } },
  ])('rejects $name', ({ message }) => {
    // Act
    const actual = isEnvelope(message);

    // Assert
    expect(actual).toBe(false);
  });
});
