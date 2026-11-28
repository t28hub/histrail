import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitForDomQuiet } from './quiet';

describe('waitForDomQuiet', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.replaceChildren();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const options = { quietMs: 1_000, maxMs: 10_000 };

  /**
   * Starts waiting on `document.body` and returns a spy called once it goes quiet.
   */
  function startWaiting(): ReturnType<typeof vi.fn> {
    const quiet = vi.fn();
    void waitForDomQuiet(document.body, options).then(quiet);
    return quiet;
  }

  /**
   * Appends text to `document.body` every 500 ms for `durationMs`.
   */
  async function keepChanging(durationMs: number): Promise<void> {
    for (let elapsed = 0; elapsed < durationMs; elapsed += 500) {
      document.body.append('tick');
      await vi.advanceTimersByTimeAsync(500);
    }
  }

  it('does not resolve before the DOM has stayed quiet', async () => {
    // Arrange
    const quiet = startWaiting();

    // Act
    await vi.advanceTimersByTimeAsync(999);

    // Assert
    expect(quiet).not.toHaveBeenCalled();
  });

  it('resolves after the DOM stays quiet', async () => {
    // Arrange
    const quiet = startWaiting();

    // Act
    await vi.advanceTimersByTimeAsync(1_000);

    // Assert
    expect(quiet).toHaveBeenCalled();
  });

  it('restarts the quiet period on each mutation', async () => {
    // Arrange
    const quiet = startWaiting();

    // Act
    await vi.advanceTimersByTimeAsync(800);
    document.body.append('late content');
    await vi.advanceTimersByTimeAsync(800);

    // Assert
    expect(quiet).not.toHaveBeenCalled();
  });

  it('restarts the quiet period when text changes', async () => {
    // Arrange
    const text = document.createTextNode('before');
    document.body.append(text);
    const quiet = startWaiting();

    // Act
    await vi.advanceTimersByTimeAsync(800);
    text.data = 'after';
    await vi.advanceTimersByTimeAsync(800);

    // Assert
    expect(quiet).not.toHaveBeenCalled();
  });

  it('ignores attribute changes, which do not change the text', async () => {
    // Arrange
    const quiet = startWaiting();

    // Act
    await vi.advanceTimersByTimeAsync(800);
    document.body.setAttribute('class', 'slide-2');
    await vi.advanceTimersByTimeAsync(200);

    // Assert
    expect(quiet).toHaveBeenCalled();
  });

  it('resolves a quiet period after the last mutation', async () => {
    // Arrange
    const quiet = startWaiting();

    // Act
    await vi.advanceTimersByTimeAsync(800);
    document.body.append('late content');
    await vi.advanceTimersByTimeAsync(1_000);

    // Assert
    expect(quiet).toHaveBeenCalled();
  });

  it('keeps waiting while the DOM changes before the upper bound', async () => {
    // Arrange
    const quiet = startWaiting();

    // Act
    await keepChanging(9_500);

    // Assert
    expect(quiet).not.toHaveBeenCalled();
  });

  it('resolves at the upper bound when the DOM keeps changing', async () => {
    // Arrange
    const quiet = startWaiting();

    // Act
    await keepChanging(10_000);

    // Assert
    expect(quiet).toHaveBeenCalled();
  });

  it('rejects when aborted', async () => {
    // Arrange
    const controller = new AbortController();
    const waiting = waitForDomQuiet(document.body, { ...options, signal: controller.signal });

    // Act
    controller.abort(new Error('superseded'));

    // Assert
    await expect(waiting).rejects.toThrow('superseded');
  });

  it('rejects immediately for an already aborted signal', async () => {
    // Arrange
    const signal = AbortSignal.abort(new Error('gone'));

    // Act
    const waiting = waitForDomQuiet(document.body, { ...options, signal });

    // Assert
    await expect(waiting).rejects.toThrow('gone');
  });
});
