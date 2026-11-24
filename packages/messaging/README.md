# `@histrail/messaging`

Typed runtime messaging for browser extensions, with no dependencies.

## Installation

Add the package to `dependencies`:

```sh
pnpm -C <package-dir> add --workspace @histrail/messaging
```

## Usage

Define a protocol map with a guard for each message type, then pass the browser's runtime:

```ts
import { defineMessaging, isObject, isString } from '@histrail/messaging';

interface Greeting {
  readonly name: string;
}

interface ProtocolMap {
  readonly greet: Greeting;
}

const { sendMessage, onMessage } = defineMessaging<ProtocolMap>(browser.runtime, {
  greet: (value: unknown): value is Greeting => {
    if (!isObject(value) || !('name' in value)) {
      return false;
    }
    return isString(value.name);
  },
});

// In a content script
await sendMessage('greet', { name: 'Alice' });

// In the background
const removeHandler = onMessage('greet', (greeting, sender) => {
  console.log(`Hello, ${greeting.name}!`, sender.url);
});

// Later, to stop handling the message
removeHandler();
```

Handlers receive only messages from identifiable senders whose data passes its guard.
