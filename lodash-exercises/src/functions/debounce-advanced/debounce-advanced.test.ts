import debounce from "./debounce-advanced";

describe("debounce (advanced)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("basic debouncing", () => {
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

    test("treats a missing wait as 0", () => {
      const fn = jest.fn();
      const debounced = debounce(fn);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(0);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe("arguments and this", () => {
    test("passes the arguments of the last call", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced("first", 1);
      debounced("second", 2);
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("second", 2);
    });

    test("uses the `this` of the last call", () => {
      const seen: string[] = [];
      const debounced = debounce(function (this: { id: string }) {
        seen.push(this.id);
      }, 100);

      debounced.call({ id: "a" });
      debounced.call({ id: "b" });
      jest.advanceTimersByTime(100);

      expect(seen).toEqual(["b"]);
    });

    test("keeps `this` when used as an object method", () => {
      const seen: string[] = [];
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
  });

  describe("cancel", () => {
    test("is a function on the debounced function", () => {
      expect(typeof debounce(jest.fn(), 100).cancel).toBe("function");
    });

    test("prevents a pending call from firing", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced.cancel();
      jest.advanceTimersByTime(1000);

      expect(fn).not.toHaveBeenCalled();
    });

    test("clears the pending timer", () => {
      const debounced = debounce(jest.fn(), 100);

      debounced();
      debounced.cancel();

      expect(jest.getTimerCount()).toBe(0);
    });

    test("does nothing when there is no pending call", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      expect(() => debounced.cancel()).not.toThrow();
      expect(fn).not.toHaveBeenCalled();
    });

    test("does nothing after the call has already fired", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      jest.advanceTimersByTime(100);
      debounced.cancel();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test("can be called repeatedly", () => {
      const debounced = debounce(jest.fn(), 100);

      debounced();
      debounced.cancel();

      expect(() => debounced.cancel()).not.toThrow();
    });

    test("lets the debounced function work again afterwards", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced("cancelled");
      debounced.cancel();
      debounced("kept");
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("kept");
    });

    test("discards the cancelled arguments so flush has nothing to run", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced("cancelled");
      debounced.cancel();
      debounced.flush();

      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe("flush", () => {
    test("is a function on the debounced function", () => {
      expect(typeof debounce(jest.fn(), 100).flush).toBe("function");
    });

    test("runs a pending call immediately", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced.flush();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test("runs the pending call with the latest arguments", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced("first");
      debounced("second");
      debounced.flush();

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("second");
    });

    test("runs the pending call with the `this` of the last call", () => {
      const seen: string[] = [];
      const debounced = debounce(function (this: { id: string }) {
        seen.push(this.id);
      }, 100);

      debounced.call({ id: "a" });
      debounced.call({ id: "b" });
      debounced.flush();

      expect(seen).toEqual(["b"]);
    });

    test("does not call the function again when the timer would have fired", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced.flush();
      jest.advanceTimersByTime(1000);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test("clears the pending timer", () => {
      const debounced = debounce(jest.fn(), 100);

      debounced();
      debounced.flush();

      expect(jest.getTimerCount()).toBe(0);
    });

    test("does nothing when there is no pending call", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced.flush();

      expect(fn).not.toHaveBeenCalled();
    });

    test("does not call the function twice when flushed twice", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced.flush();
      debounced.flush();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test("does nothing after the call has already fired", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      jest.advanceTimersByTime(100);
      debounced.flush();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    test("lets the debounced function work again afterwards", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced("one");
      debounced.flush();
      debounced("two");
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenNthCalledWith(1, "one");
      expect(fn).toHaveBeenNthCalledWith(2, "two");
    });
  });

  describe("independence", () => {
    test("keeps separate timers and pending state per debounced function", () => {
      const fnA = jest.fn();
      const fnB = jest.fn();
      const debouncedA = debounce(fnA, 100);
      const debouncedB = debounce(fnB, 100);

      debouncedA("a");
      debouncedB("b");
      debouncedA.cancel();
      jest.advanceTimersByTime(100);

      expect(fnA).not.toHaveBeenCalled();
      expect(fnB).toHaveBeenCalledWith("b");
    });

    test("flushing one debounced function does not run another", () => {
      const fnA = jest.fn();
      const fnB = jest.fn();
      const debouncedA = debounce(fnA, 100);
      const debouncedB = debounce(fnB, 100);

      debouncedA();
      debouncedB();
      debouncedA.flush();

      expect(fnA).toHaveBeenCalledTimes(1);
      expect(fnB).not.toHaveBeenCalled();
    });
  });
});
