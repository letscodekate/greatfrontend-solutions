import once from './once';

describe('once', () => {
  test('only calls the underlying function on the first invocation', () => {
    let i = 1;
    function incrementBy(value: number) {
      i += value;
      return i;
    }

    const incrementByOnce = once(incrementBy);

    // First call: func actually runs, i is mutated, and the fresh result is returned.
    expect(incrementByOnce(2)).toBe(3);
    expect(i).toBe(3);

    // Second call: func does NOT run again (i is untouched), cached result (3) is returned.
    expect(incrementByOnce(3)).toBe(3);
    expect(i).toBe(3);

    // Even if outside state changes afterwards, once() still ignores further calls.
    i = 4;
    expect(incrementByOnce(2)).toBe(3);
    expect(i).toBe(4);
  });

  test('passes arguments through to the wrapped function on the first call', () => {
    const add = jest.fn((a: number, b: number) => a + b);
    const addOnce = once(add);

    expect(addOnce(2, 3)).toBe(5);
    expect(add).toHaveBeenCalledWith(2, 3);
    expect(add).toHaveBeenCalledTimes(1);

    // Later calls are ignored, even with different arguments.
    expect(addOnce(10, 20)).toBe(5);
    expect(add).toHaveBeenCalledTimes(1);
  });

  test('preserves the `this` context of the first call', () => {
    const obj = {
      value: 42,
      getValue: once(function (this: { value: number }) {
        return this.value;
      }),
    };

    expect(obj.getValue()).toBe(42);
  });

  test('underlying function is invoked exactly once no matter how many times the wrapper is called', () => {
    const fn = jest.fn(() => 'result');
    const onceFn = once(fn);

    onceFn();
    onceFn();
    onceFn();

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
