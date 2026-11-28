import { describe, expect, it } from 'vitest';
import type { RuntimeMessageSender } from './runtime';
import { toMessageSender } from './sender';

describe('toMessageSender', () => {
  it('describes a script in a tab', () => {
    // Arrange
    const contentScript = {
      id: 'histrail-test',
      url: 'https://example.com/article',
      frameId: 0,
      tab: { id: 7, incognito: false },
    };

    // Act
    const actual = toMessageSender(contentScript);

    // Assert
    expect(actual).toEqual({
      kind: 'tab',
      extensionId: 'histrail-test',
      tabId: 7,
      frameId: 0,
      incognito: false,
      url: 'https://example.com/article',
    });
  });

  it('describes an extension page outside any tab', () => {
    // Arrange
    const popup = {
      id: 'histrail-test',
      url: 'chrome-extension://histrail-test/popup.html',
    };

    // Act
    const actual = toMessageSender(popup);

    // Assert
    expect(actual).toEqual({
      kind: 'extension-page',
      extensionId: 'histrail-test',
      url: 'chrome-extension://histrail-test/popup.html',
    });
  });

  it.each<{ name: string; sender: RuntimeMessageSender }>([
    {
      name: 'no extension ID',
      sender: {
        url: 'https://example.com/article',
        frameId: 0,
        tab: { id: 7, incognito: false },
      },
    },
    {
      name: 'no URL',
      sender: {
        id: 'histrail-test',
        frameId: 0,
        tab: { id: 7, incognito: false },
      },
    },
    {
      name: 'a tab without an ID',
      sender: {
        id: 'histrail-test',
        url: 'https://example.com/article',
        frameId: 0,
        tab: { incognito: false },
      },
    },
    {
      name: 'a devtools window',
      sender: {
        id: 'histrail-test',
        url: 'https://example.com/article',
        frameId: 0,
        tab: { id: -1, incognito: false },
      },
    },
    {
      name: 'a tab without a frame ID',
      sender: {
        id: 'histrail-test',
        url: 'https://example.com/article',
        tab: { id: 7, incognito: false },
      },
    },
  ])('rejects a sender with $name', ({ sender }) => {
    // Act
    const actual = toMessageSender(sender);

    // Assert
    expect(actual).toBeUndefined();
  });
});
