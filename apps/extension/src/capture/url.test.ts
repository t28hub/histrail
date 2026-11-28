import { describe, expect, it } from 'vitest';
import { isSamePage, parseHttpUrl } from './url';

describe('parseHttpUrl', () => {
  it.each([
    {
      name: 'an HTTP URL',
      value: 'http://example.com/article',
      href: 'http://example.com/article',
    },
    {
      name: 'an HTTPS URL',
      value: 'https://example.com/article',
      href: 'https://example.com/article',
    },
    {
      name: 'an uppercase scheme',
      value: 'HTTPS://example.com/article',
      href: 'https://example.com/article',
    },
  ])('parses $name', ({ value, href }) => {
    // Act
    const actual = parseHttpUrl(value);

    // Assert
    expect(actual?.href).toBe(href);
  });

  it.each([
    {
      name: 'a file: URL',
      value: 'file:///home/user/page.html',
    },
    {
      name: 'a javascript: URL',
      value: 'javascript:void(0)',
    },
    {
      name: 'a data: URL',
      value: 'data:text/plain,a',
    },
  ])('rejects $name when the scheme is not HTTP or HTTPS', ({ value }) => {
    // Act
    const actual = parseHttpUrl(value);

    // Assert
    expect(actual).toBeNull();
  });

  it.each([
    {
      name: 'a scheme without a host',
      value: 'https://',
    },
    {
      name: 'a relative URL',
      value: '/article',
    },
    {
      name: 'an empty string',
      value: '',
    },
  ])('rejects $name when it does not parse as an absolute URL', ({ value }) => {
    // Act
    const actual = parseHttpUrl(value);

    // Assert
    expect(actual).toBeNull();
  });
});

describe('isSamePage', () => {
  it.each([
    {
      name: 'identical URLs',
      a: 'https://example.com/article',
      b: 'https://example.com/article',
    },
    {
      name: 'URLs with different fragments',
      a: 'https://example.com/article#intro',
      b: 'https://example.com/article#summary',
    },
    {
      name: 'a URL and the same URL with a fragment',
      a: 'https://example.com/article',
      b: 'https://example.com/article#intro',
    },
  ])('treats $name as the same page', ({ a, b }) => {
    // Act
    const actual = isSamePage(new URL(a), new URL(b));

    // Assert
    expect(actual).toBe(true);
  });

  it.each([
    {
      name: 'different paths',
      a: 'https://example.com/article',
      b: 'https://example.com/about',
    },
    {
      name: 'different queries',
      a: 'https://example.com/search?q=a',
      b: 'https://example.com/search?q=b',
    },
  ])('treats URLs with $name as different pages', ({ a, b }) => {
    // Act
    const actual = isSamePage(new URL(a), new URL(b));

    // Assert
    expect(actual).toBe(false);
  });
});
