import curry from "./curry";

describe("curry", () => {
  test("empty function", () => {
    const empty = () => 0;
    const curried = curry(empty);
    expect(curried()).toBe(0);
  });

  test("supports calling with one argument at a time", () => {
    function sum(a: number, b: number, c: number) {
      return a + b + c;
    }
    const curriedSum = curry(sum);

    expect(curriedSum(1)(2)(3)).toBe(6);
  });

  test("only reads the first argument of each call, ignoring any extras", () => {
    function sum(a: number, b: number, c: number) {
      return a + b + c;
    }
    const curriedSum = curry(sum);

    // The second value in each call is silently dropped, not collected.
    expect(curriedSum(1, 100)(2, 200)(3, 300)).toBe(6);
  });

  test("does not call the underlying function until enough arguments are collected", () => {
    const fn = jest.fn((a: number, b: number, c: number) => a + b + c);
    const curriedFn = curry(fn);

    const step1 = curriedFn(1);
    expect(fn).not.toHaveBeenCalled();

    const step2 = step1(2);
    expect(fn).not.toHaveBeenCalled();

    const result = step2(3);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result).toBe(6);
  });

  test("a partially applied function can be reused independently for different completions", () => {
    function sum(a: number, b: number, c: number) {
      return a + b + c;
    }
    const curriedSum = curry(sum);

    const add1 = curriedSum(1);

    expect(add1(10)(20)).toBe(31);
    expect(add1(2)(3)).toBe(6);
  });

  test("respects the arity of the underlying function (func.length)", () => {
    function add2(a: number, b: number) {
      return a + b;
    }
    const curriedAdd2 = curry(add2);

    expect(curriedAdd2(1)(2)).toBe(3);

    function add4(a: number, b: number, c: number, d: number) {
      return a + b + c + d;
    }
    const curriedAdd4 = curry(add4);

    expect(curriedAdd4(1)(2)(3)(4)).toBe(10);
  });

  test("returns a function (not a value) while arguments are still missing", () => {
    function sum(a: number, b: number, c: number) {
      return a + b + c;
    }
    const curriedSum = curry(sum);

    expect(typeof curriedSum(1)).toBe("function");
    expect(typeof curriedSum(1)(2)).toBe("function");
  });

  test("an empty call is ignored and does not consume a slot", () => {
    function sum(a: number, b: number, c: number) {
      return a + b + c;
    }
    const curriedSum = curry(sum);

    expect(curriedSum(1)()(2)()()(3)).toBe(6);
  });

  test("returns unary collectors", () => {
    const mulThree = (a: number, b: number, c: number) => a * b * c;
    const curried = curry(mulThree);
    expect(curried).toHaveLength(1);

    const withSeven = curried(7);
    expect(withSeven).toHaveLength(1);

    const withSevenAndThree = withSeven(3);
    expect(withSevenAndThree).toHaveLength(1);
    expect(withSevenAndThree(2)).toBe(42);
  });

  describe("multiple arguments", () => {
    test("preserves this across partial applications", () => {
      const curried = curry(function fn(this: any, foo: number, bar: number) {
        return this.base * foo + bar;
      });

      const obj = { base: 5, mul: curried };
      expect(obj.mul()).toBeInstanceOf(Function);
      expect(obj.mul(3)(2)).toBe(17);
      expect(obj.mul(3)()(2)).toBe(17);
      expect(obj.mul()(3)()(2)).toBe(17);
    });
  });
});
