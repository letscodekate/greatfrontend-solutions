import debounce from "./debounce";

describe("debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("timing", () => {
    test("does not call the function immediately", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();

      expect(fn).not.toHaveBeenCalled();
    });

    test("does not call the function before the wait has elapsed", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      jest.advanceTimersByTime(99);

      expect(fn).not.toHaveBeenCalled();
    });

    test("calls the function once the wait has elapsed", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test("never calls the function if the debounced function is never called", () => {
      const fn = jest.fn();
      debounce(fn, 100);

      jest.advanceTimersByTime(1000);

      expect(fn).not.toHaveBeenCalled();
    });

    test("supports a wait of 0", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 0);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(0);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe("repeated calls", () => {
    test("calls the function only once for a burst of calls", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test("restarts the wait on every call", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      jest.advanceTimersByTime(50);
      debounced();
      jest.advanceTimersByTime(50);

      // 100ms after the first call, but only 50ms after the second.
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test("can be triggered again after a previous call has fired", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      jest.advanceTimersByTime(100);
      debounced();
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(2);
    });

    test("does not fire again without a new call", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      jest.advanceTimersByTime(1000);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test("leaves no pending timers after the call has fired", () => {
      const debounced = debounce(jest.fn(), 100);

      debounced();
      jest.advanceTimersByTime(100);

      expect(jest.getTimerCount()).toBe(0);
    });

    test("keeps only one pending timer during a burst", () => {
      const debounced = debounce(jest.fn(), 100);

      debounced();
      debounced();
      debounced();

      expect(jest.getTimerCount()).toBe(1);
    });
  });

  describe("arguments", () => {
    test("passes the arguments to the function", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced(1, "two", { three: 3 });
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith(1, "two", { three: 3 });
    });

    test("uses the arguments of the last call in a burst", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced("first");
      debounced("second");
      debounced("third");
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("third");
    });

    test("works with no arguments", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith();
    });
  });

  describe("this binding", () => {
    test("calls the function with the `this` of the debounced call", () => {
      const seen: unknown[] = [];
      const obj = {
        name: "obj",
        method: debounce(function (this: { name: string }) {
          seen.push(this.name);
        }, 100),
      };

      obj.method();
      jest.advanceTimersByTime(100);

      expect(seen).toEqual(["obj"]);
    });

    test("uses the `this` of the last call in a burst", () => {
      const seen: string[] = [];
      const debounced = debounce(function (this: { id: string }) {
        seen.push(this.id);
      }, 100);

      debounced.call({ id: "a" });
      debounced.call({ id: "b" });
      jest.advanceTimersByTime(100);

      expect(seen).toEqual(["b"]);
    });
  });

  describe("independence", () => {
    test("keeps separate timers for separate debounced functions", () => {
      const fnA = jest.fn();
      const fnB = jest.fn();
      const debouncedA = debounce(fnA, 100);
      const debouncedB = debounce(fnB, 100);

      debouncedA();
      debouncedB();
      jest.advanceTimersByTime(100);

      expect(fnA).toHaveBeenCalledTimes(1);
      expect(fnB).toHaveBeenCalledTimes(1);
    });

    test("calling one debounced function does not reset another", () => {
      const fnA = jest.fn();
      const fnB = jest.fn();
      const debouncedA = debounce(fnA, 100);
      const debouncedB = debounce(fnB, 100);

      debouncedA();
      jest.advanceTimersByTime(50);
      debouncedB();
      jest.advanceTimersByTime(50);

      expect(fnA).toHaveBeenCalledTimes(1);
      expect(fnB).not.toHaveBeenCalled();
    });

    test("respects each function's own wait", () => {
      const short = jest.fn();
      const long = jest.fn();
      const debouncedShort = debounce(short, 50);
      const debouncedLong = debounce(long, 200);

      debouncedShort();
      debouncedLong();
      jest.advanceTimersByTime(50);

      expect(short).toHaveBeenCalledTimes(1);
      expect(long).not.toHaveBeenCalled();

      jest.advanceTimersByTime(150);
      expect(long).toHaveBeenCalledTimes(1);
    });
  });

  describe("types", () => {
    test("the debounced function keeps the parameter types of the original", () => {
      const debounced = debounce((a: number, b: string) => `${a}${b}`, 100);

      debounced(1, "x");

      // @ts-expect-error - first argument must be a number
      debounced("1", "x");
      // @ts-expect-error - second argument is required
      debounced(1);
    });

    test("the debounced function returns void", () => {
      const debounced = debounce(() => 42, 100);
      const result: void = debounced();

      expect(result).toBeUndefined();
    });
  });
});
