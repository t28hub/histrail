import type { ExtensionId, MessageSender, TabId, TabSender } from '@histrail/messaging';
import { describe, expect, it } from 'vitest';
import { checkCaptureSender, type Rejection } from './sender';

describe('checkCaptureSender', () => {
  it('accepts a content script in a top-level frame', () => {
    // Arrange
    const sender: TabSender = {
      kind: 'tab',
      extensionId: 'histrail-test' as ExtensionId,
      tabId: 1 as TabId,
      frameId: 0,
      incognito: false,
      url: 'https://example.com/article',
    };

    // Act
    const actual = checkCaptureSender(sender);

    // Assert
    expect(actual).toBeNull();
  });

  it.each<{ name: string; sender: MessageSender; reason: Rejection }>([
    {
      name: 'an extension page outside any tab',
      sender: {
        kind: 'extension-page',
        extensionId: 'histrail-test' as ExtensionId,
        url: 'chrome-extension://histrail-test/popup.html',
      },
      reason: 'not-content-script',
    },
    {
      name: 'a subframe',
      sender: {
        kind: 'tab',
        extensionId: 'histrail-test' as ExtensionId,
        tabId: 1 as TabId,
        frameId: 3,
        incognito: false,
        url: 'https://example.com/article',
      },
      reason: 'not-top-frame',
    },
    {
      name: 'a private window',
      sender: {
        kind: 'tab',
        extensionId: 'histrail-test' as ExtensionId,
        tabId: 1 as TabId,
        frameId: 0,
        incognito: true,
        url: 'https://example.com/article',
      },
      reason: 'incognito',
    },
    {
      name: 'a non-HTTP page',
      sender: {
        kind: 'tab',
        extensionId: 'histrail-test' as ExtensionId,
        tabId: 1 as TabId,
        frameId: 0,
        incognito: false,
        url: 'file:///home/user/page.html',
      },
      reason: 'unsupported-url',
    },
  ])('rejects $name', ({ sender, reason }) => {
    // Act
    const actual = checkCaptureSender(sender);

    // Assert
    expect(actual).toBe(reason);
  });
});
