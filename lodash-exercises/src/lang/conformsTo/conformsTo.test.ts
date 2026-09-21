import conformsTo from "./conformsTo";

describe("conformsTo", () => {
  test("empty array", () => {
    expect(conformsTo({}, { b: (n: number) => n > 1 })).toEqual(false);
  });

  test("single-element arrays", () => {
    expect(conformsTo({ b: 2 }, { b: (n) => n > 1 })).toEqual(true);
  });

  test("two-element arrays", () => {
    expect(conformsTo({ a: 1, b: 2 }, { b: (n) => n > 2 })).toEqual(false);
  });

  describe("empty source", () => {
    test("returns true for an empty source and a non-empty object", () => {
      expect(conformsTo({ a: 1 }, {})).toBe(true);
    });

    test("returns true when both object and source are empty", () => {
      expect(conformsTo({}, {})).toBe(true);
    });
  });

  describe("multiple predicates", () => {
    test("returns true when every predicate passes", () => {
      expect(
        conformsTo<number>(
          { a: 1, b: 2, c: 3 },
          { a: (n) => n === 1, b: (n) => n > 1, c: (n) => n < 4 },
        ),
      ).toBe(true);
    });

    test("returns false when only one predicate fails", () => {
      expect(
        conformsTo<number>(
          { a: 1, b: 2, c: 3 },
          { a: (n) => n === 1, b: (n) => n > 5, c: (n) => n < 4 },
        ),
      ).toBe(false);
    });

    test("returns false when every predicate fails", () => {
      expect(
        conformsTo<number>({ a: 1, b: 2 }, { a: (n) => n > 5, b: (n) => n > 5 }),
      ).toBe(false);
    });

    test("stops calling predicates after the first failure", () => {
      const first = jest.fn(() => false);
      const second = jest.fn(() => true);

      expect(conformsTo<number>({ a: 1, b: 2 }, { a: first, b: second })).toBe(
        false,
      );
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).not.toHaveBeenCalled();
    });
  });

  describe("object keys not in source", () => {
    test("ignores extra properties on the object", () => {
      expect(
        conformsTo<number>({ a: 1, b: 2, c: 3, d: 4 }, { b: (n) => n === 2 }),
      ).toBe(true);
    });

    test("does not call predicates for keys the source does not name", () => {
      const predicate = jest.fn(() => true);

      conformsTo<number>({ a: 1, b: 2 }, { a: predicate });

      expect(predicate).toHaveBeenCalledTimes(1);
    });
  });

  describe("predicate invocation", () => {
    test("calls each predicate once with the matching property value", () => {
      const predicate = jest.fn(() => true);

      conformsTo<number>({ a: 1, b: 2 }, { b: predicate });

      expect(predicate).toHaveBeenCalledTimes(1);
      expect(predicate).toHaveBeenCalledWith(2);
    });

    test("passes the value only, not the key or the object", () => {
      const predicate = jest.fn(() => true);

      conformsTo<number>({ a: 1 }, { a: predicate });

      expect(predicate.mock.calls[0]).toHaveLength(1);
    });
  });

  describe("missing keys", () => {
    test("returns false when the object lacks a key named in source", () => {
      expect(conformsTo<number>({ a: 1 }, { b: () => true })).toBe(false);
    });

    test("does not call the predicate for a missing key", () => {
      const predicate = jest.fn(() => true);

      conformsTo<number>({ a: 1 }, { b: predicate });

      expect(predicate).not.toHaveBeenCalled();
    });

    test("returns false if any one of several keys is missing", () => {
      expect(
        conformsTo<number>({ a: 1 }, { a: () => true, b: () => true }),
      ).toBe(false);
    });
  });

  describe("falsy property values", () => {
    test.each([
      ["0", 0],
      ["false", false],
      ["an empty string", ""],
      ["null", null],
      ["NaN", NaN],
    ])("passes %s to the predicate instead of treating it as missing", (_, v) => {
      const predicate = jest.fn(() => true);

      expect(conformsTo<unknown>({ a: v }, { a: predicate })).toBe(true);
      expect(predicate).toHaveBeenCalledWith(v);
    });

    test("uses the predicate result for a falsy value", () => {
      expect(conformsTo<number>({ a: 0 }, { a: (n) => n === 0 })).toBe(true);
      expect(conformsTo<number>({ a: 0 }, { a: (n) => n > 0 })).toBe(false);
    });

    test("calls the predicate when the key exists with value undefined", () => {
      const predicate = jest.fn((v: unknown) => v === undefined);

      expect(conformsTo<unknown>({ a: undefined }, { a: predicate })).toBe(true);
      expect(predicate).toHaveBeenCalledWith(undefined);
    });
  });

  describe("value types", () => {
    test("supports predicates over strings and booleans", () => {
      expect(
        conformsTo<unknown>(
          { name: "kate", active: true },
          {
            name: (v) => typeof v === "string" && v.length > 0,
            active: (v) => v === true,
          },
        ),
      ).toBe(true);
    });

    test("supports object, array, and function values", () => {
      const fn = () => 1;

      expect(
        conformsTo<unknown>(
          { obj: { x: 1 }, list: [1, 2], fn },
          {
            obj: (v) => (v as { x: number }).x === 1,
            list: (v) => Array.isArray(v) && v.length === 2,
            fn: (v) => v === fn,
          },
        ),
      ).toBe(true);
    });
  });

  describe("purity", () => {
    test("does not mutate the object or the source", () => {
      const object = { a: 1, b: 2 };
      const source = { a: (n: number) => n > 0 };
      const objectSnapshot = { ...object };
      const sourceKeys = Object.keys(source);

      conformsTo(object, source);

      expect(object).toEqual(objectSnapshot);
      expect(Object.keys(source)).toEqual(sourceKeys);
    });

    test("returns a boolean, not the predicate's return value", () => {
      expect(conformsTo<number>({ a: 1 }, { a: () => true })).toBe(true);
      expect(conformsTo<number>({ a: 1 }, { a: () => false })).toBe(false);
    });
  });
});
