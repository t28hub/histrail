import { beforeEach, describe, expect, it } from 'vitest';
import { captureDocument } from './document';

describe('captureDocument', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    document.documentElement.removeAttribute('lang');
  });

  it('captures the URL, title and rendered text', () => {
    // Arrange
    document.title = 'Synthetic page';
    document.body.innerHTML = '<h1>Heading</h1><p>Body text</p>';

    // Act
    const actual = captureDocument(document);

    // Assert
    expect(actual).toMatchObject({ url: document.URL, title: 'Synthetic page' });
    expect(actual.text).toContain('Heading');
    expect(actual.text).toContain('Body text');
  });

  it('resolves a relative canonical URL', () => {
    // Arrange
    document.head.innerHTML = '<link rel="canonical" href="/article">';

    // Act
    const actual = captureDocument(document);

    // Assert
    expect(actual.canonicalUrl).toBe(new URL('/article', document.URL).href);
  });

  it('finds a canonical link among other rel tokens', () => {
    // Arrange
    document.head.innerHTML = '<link rel="Canonical alternate" href="https://example.com/a">';

    // Act
    const actual = captureDocument(document);

    // Assert
    expect(actual.canonicalUrl).toBe('https://example.com/a');
  });

  it.each([
    {
      name: 'the page has none',
      head: '',
      body: '',
    },
    {
      name: 'the link is in the body',
      head: '',
      body: '<link rel="canonical" href="https://example.com/a">',
    },
    {
      name: 'the link has no href',
      head: '<link rel="canonical">',
      body: '',
    },
    {
      name: 'the link is a javascript: URL',
      head: '<link rel="canonical" href="javascript:void(0)">',
      body: '',
    },
    {
      name: 'the link is a data: URL',
      head: '<link rel="canonical" href="data:text/plain,a">',
      body: '',
    },
  ])('reports no canonical URL when $name', ({ head, body }) => {
    // Arrange
    document.head.innerHTML = head;
    document.body.innerHTML = body;

    // Act
    const actual = captureDocument(document);

    // Assert
    expect(actual.canonicalUrl).toBeNull();
  });

  it('captures the language as the page wrote it', () => {
    // Arrange
    document.documentElement.lang = 'ja-JP';

    // Act
    const actual = captureDocument(document);

    // Assert
    expect(actual.lang).toBe('ja-JP');
  });

  it.each([
    { name: 'missing', lang: undefined },
    { name: 'empty', lang: '' },
  ])('reports no language when the attribute is $name', ({ lang }) => {
    // Arrange
    if (lang !== undefined) {
      document.documentElement.lang = lang;
    }

    // Act
    const actual = captureDocument(document);

    // Assert
    expect(actual.lang).toBeNull();
  });
});
