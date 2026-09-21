import throttle from './leading-only-throttle';

describe('leading-only throttle', () => {
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

  test('ignores subsequent calls made within the wait window', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(50);
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('does not fire a trailing call once the window elapses on its own', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();

    jest.advanceTimersByTime(100);

    // No call was queued to run after the window; nothing should fire
    // just because time passed.
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('allows a new call once the wait window has fully elapsed', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(100);
    throttled();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('a call during the window does not extend or reset the window', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled(); // fires at t=0, window scheduled to close at t=100
    jest.advanceTimersByTime(50);
    throttled(); // ignored; must NOT push the window out to t=150

    jest.advanceTimersByTime(50); // now at t=100 total
    throttled(); // window has closed, this should fire

    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('passes arguments through to the underlying function', () => {
    const fn = jest.fn((a: number, b: number) => a + b);
    const throttled = throttle(fn, 100);

    throttled(2, 3);

    expect(fn).toHaveBeenCalledWith(2, 3);
  });

  test('preserves the `this` context of the call', () => {
    const fn = jest.fn(function (this: { value: number }) {
      return this.value;
    });
    const obj = {
      value: 42,
      getValue: throttle(fn, 100),
    };

    obj.getValue();

    expect(fn.mock.instances[0]).toBe(obj);
  });
});
