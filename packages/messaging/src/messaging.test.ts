import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { isNumber, isObject, isString } from './guard';
import { defineMessaging } from './messaging';
import type { Runtime, RuntimeListener, RuntimeMessageSender } from './runtime';

interface Greeting {
  /**
   * Who to greet.
   */
  readonly name: string;
}

interface TestProtocol {
  /**
   * A message with object data.
   */
  readonly greet: Greeting;

  /**
   * A message with primitive data.
   */
  readonly count: number;
}

const isGreeting = (value: unknown): value is Greeting => {
  if (!isObject(value) || !('name' in value)) {
    return false;
  }
  return isString(value.name);
};

const guards = {
  greet: isGreeting,
  count: isNumber,
};

/**
 * Records sent messages and lets tests deliver messages from any sender.
 */
class FakeRuntime implements Runtime {
  /**
   * Every message passed to {@link FakeRuntime.sendMessage}, in order.
   */
  readonly sent: unknown[] = [];
  /**
   * The listeners added through `onMessage`.
   */
  readonly #listeners = new Set<RuntimeListener>();

  /**
   * Adds and removes listeners like the browser's `runtime.onMessage`.
   */
  readonly onMessage = {
    /**
     * Starts calling `listener` for each delivered message.
     */
    addListener: (listener: RuntimeListener) => this.#listeners.add(listener),
    /**
     * Stops calling `listener`.
     */
    removeListener: (listener: RuntimeListener) => this.#listeners.delete(listener),
  };

  /**
   * Records `message` instead of sending it.
   */
  async sendMessage(message: unknown): Promise<unknown> {
    this.sent.push(message);
    return undefined;
  }

  /**
   * Calls every listener with `message` as if `sender` had sent it.
   */
  deliver(message: unknown, sender: RuntimeMessageSender): void {
    for (const listener of this.#listeners) {
      listener(message, sender);
    }
  }
}

const contentScript = {
  id: 'histrail-test',
  url: 'https://example.com/article',
  frameId: 0,
  tab: { id: 7, incognito: false },
} as const satisfies RuntimeMessageSender;

describe('defineMessaging', () => {
  let runtime: FakeRuntime;

  beforeEach(() => {
    runtime = new FakeRuntime();
  });

  it('types data by message type', () => {
    // Arrange
    const { sendMessage, onMessage } = defineMessaging<TestProtocol>(runtime, guards);

    // Assert
    onMessage('greet', (data) => expectTypeOf(data).toEqualTypeOf<Greeting>());
    onMessage('count', (data) => expectTypeOf(data).toEqualTypeOf<number>());
    expectTypeOf(sendMessage).toBeCallableWith('count', 3);
    // @ts-expect-error `count` carries a number.
    expectTypeOf(sendMessage).toBeCallableWith('count', 'three');
    // @ts-expect-error Every message type needs a guard.
    defineMessaging<TestProtocol>(runtime, { greet: isGreeting });
  });

  it('sends data wrapped with its type', async () => {
    // Arrange
    const { sendMessage } = defineMessaging<TestProtocol>(runtime, guards);

    // Act
    await sendMessage('greet', { name: 'Alice' });

    // Assert
    expect(runtime.sent).toEqual([{ type: 'greet', data: { name: 'Alice' } }]);
  });

  it('delivers the data and sender of a message to the handler of its type', () => {
    // Arrange
    const { onMessage } = defineMessaging<TestProtocol>(runtime, guards);
    const handler = vi.fn();
    onMessage('greet', handler);

    // Act
    runtime.deliver({ type: 'greet', data: { name: 'Alice' } }, contentScript);

    // Assert
    expect(handler).toHaveBeenCalledWith(
      { name: 'Alice' },
      expect.objectContaining({ kind: 'tab', tabId: 7 }),
    );
  });

  it('does not deliver a message to the handler of another type', () => {
    // Arrange
    const { onMessage } = defineMessaging<TestProtocol>(runtime, guards);
    const greet = vi.fn();
    const count = vi.fn();
    onMessage('greet', greet);
    onMessage('count', count);

    // Act
    runtime.deliver({ type: 'count', data: 3 }, contentScript);

    // Assert
    expect(greet).not.toHaveBeenCalled();
    expect(count).toHaveBeenCalledWith(3, expect.anything());
  });

  it.each([
    ['no envelope', { unrelated: true }, contentScript],
    ['data its guard rejects', { type: 'greet', data: { name: 42 } }, contentScript],
    ['an unidentifiable sender', { type: 'greet', data: { name: 'Alice' } }, {}],
  ])('drops a message with %s', (_, message, sender) => {
    // Arrange
    const { onMessage } = defineMessaging<TestProtocol>(runtime, guards);
    const handler = vi.fn();
    onMessage('greet', handler);

    // Act
    runtime.deliver(message, sender);

    // Assert
    expect(handler).not.toHaveBeenCalled();
  });

  it('stops delivering after the handler is removed', () => {
    // Arrange
    const { onMessage } = defineMessaging<TestProtocol>(runtime, guards);
    const handler = vi.fn();
    const remove = onMessage('greet', handler);

    // Act
    remove();
    runtime.deliver({ type: 'greet', data: { name: 'Alice' } }, contentScript);

    // Assert
    expect(handler).not.toHaveBeenCalled();
  });
});
