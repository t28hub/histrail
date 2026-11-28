import { defineBackground } from 'wxt/utils/define-background';
import { checkCaptureSender } from '../capture/sender';
import { onMessage } from '../messages';

export default defineBackground(() => {
  onMessage('capture', (data, sender) => {
    // Dropped until the native messaging host exists. Logs carry no page text or URLs.
    const rejection = checkCaptureSender(sender);
    if (rejection !== null) {
      console.debug('capture rejected', rejection);
      return;
    }
    console.debug('capture accepted', data.text.length);
  });
});
