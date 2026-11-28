import { describe, expect, it } from 'vitest';
import { isCapture } from './guard';
import type { Capture } from './types';

describe('isCapture', () => {
  it.each([
    {
      name: 'a capture',
      value: {
        url: 'https://example.com/article',
        title: 'Article',
        canonicalUrl: 'https://example.com/article',
        lang: 'en',
        text: 'Body text',
      } satisfies Capture,
    },
    {
      name: 'a capture without a canonical URL',
      value: {
        url: 'https://example.com/article',
        title: 'Article',
        canonicalUrl: null,
        lang: 'en',
        text: 'Body text',
      } satisfies Capture,
    },
    {
      name: 'a capture without a language',
      value: {
        url: 'https://example.com/article',
        title: 'Article',
        canonicalUrl: 'https://example.com/article',
        lang: null,
        text: 'Body text',
      } satisfies Capture,
    },
    {
      name: 'a capture without a canonical URL or language',
      value: {
        url: 'https://example.com/article',
        title: 'Article',
        canonicalUrl: null,
        lang: null,
        text: 'Body text',
      } satisfies Capture,
    },
  ])('accepts $name', ({ value }) => {
    // Act
    const actual = isCapture(value);

    // Assert
    expect(actual).toBe(true);
  });

  it.each([
    {
      name: 'a non-object',
      value: 'capture',
    },
    {
      name: 'null',
      value: null,
    },
    {
      name: 'a missing field',
      value: {
        url: 'https://example.com/article',
        title: 'Article',
        canonicalUrl: 'https://example.com/article',
        lang: 'en',
      },
    },
    {
      name: 'a wrong field type',
      value: {
        url: 'https://example.com/article',
        title: 42,
        canonicalUrl: 'https://example.com/article',
        lang: 'en',
        text: 'Body text',
      },
    },
    {
      name: 'a wrong nullable field type',
      value: {
        url: 'https://example.com/article',
        title: 'Article',
        canonicalUrl: 'https://example.com/article',
        lang: 42,
        text: 'Body text',
      },
    },
  ])('rejects $name', ({ value }) => {
    // Act
    const actual = isCapture(value);

    // Assert
    expect(actual).toBe(false);
  });
});
