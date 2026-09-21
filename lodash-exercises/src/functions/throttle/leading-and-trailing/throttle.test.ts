import throttle from './throttle';

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('invokes the function immediately on the first call', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('ignores subsequent calls until the wait window elapses', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();

    // Only the leading call has fired so far; the rest are queued.
    expect(fn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(50);

    // Still within the window: nothing new has fired yet.
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('fires a trailing call with the latest queued arguments once the window elapses', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled('a'); // leading call, fires immediately
    throttled('b'); // queued
    throttled('c'); // queued, overwrites the previous queued args

    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'a');
    expect(fn).toHaveBeenNthCalledWith(2, 'c');
  });

  test('a single isolated call does not produce a trailing echo', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled('only-call');
    expect(fn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(100);

    // No other calls came in during the window, so nothing should fire again.
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('starts a fresh leading+trailing cycle once the previous cycle has completed', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled('a1'); // leading, fires (call 1)
    throttled('a2'); // queued
    jest.advanceTimersByTime(100); // trailing fires with 'a2' (call 2)
    expect(fn).toHaveBeenCalledTimes(2);

    throttled('b1'); // new cycle: leading, fires (call 3)
    throttled('b2'); // queued
    jest.advanceTimersByTime(100); // trailing fires with 'b2' (call 4)

    expect(fn).toHaveBeenCalledTimes(4);
    expect(fn).toHaveBeenNthCalledWith(1, 'a1');
    expect(fn).toHaveBeenNthCalledWith(2, 'a2');
    expect(fn).toHaveBeenNthCalledWith(3, 'b1');
    expect(fn).toHaveBeenNthCalledWith(4, 'b2');
  });

  test('passes arguments through to the leading call', () => {
    const fn = jest.fn((a: number, b: number) => a + b);
    const throttled = throttle(fn, 100);

    throttled(2, 3);

    expect(fn).toHaveBeenCalledWith(2, 3);
  });

  test('preserves the `this` context for both the leading and trailing calls', () => {
    const fn = jest.fn(function (this: { value: number }) {
      return this.value;
    });
    const obj = {
      value: 42,
      getValue: throttle(fn, 100),
    };

    obj.getValue(); // leading
    obj.getValue(); // queued, produces the trailing call
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.instances[0]).toBe(obj);
    expect(fn.mock.instances[1]).toBe(obj);
  });
});
