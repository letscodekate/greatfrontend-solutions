import deepClone from './deepClone';

describe('deepClone', () => {
  describe('primitives', () => {
    test('returns numbers as-is', () => {
      expect(deepClone(42)).toBe(42);
    });

    test('returns strings as-is', () => {
      expect(deepClone('hello')).toBe('hello');
    });

    test('returns booleans as-is', () => {
      expect(deepClone(true)).toBe(true);
      expect(deepClone(false)).toBe(false);
    });

    test('returns null as-is', () => {
      expect(deepClone(null)).toBe(null);
    });

    test('returns undefined as-is', () => {
      expect(deepClone(undefined)).toBe(undefined);
    });

    test('returns NaN as-is', () => {
      expect(deepClone(NaN)).toBeNaN();
    });
  });

  describe('arrays', () => {
    test('clones a flat array', () => {
      const original = [1, 2, 3];
      const clone = deepClone(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
    });

    test('clones nested arrays independently', () => {
      const original = [1, [2, 3, [4, 5]]];
      const clone = deepClone(original);

      expect(clone).toEqual(original);
      expect(clone[1]).not.toBe(original[1]);
      expect((clone[1] as number[])[2]).not.toBe((original[1] as number[])[2]);

      (clone[1] as number[])[0] = 999;
      expect((original[1] as number[])[0]).toBe(2);
    });

    test('clones an array of objects independently', () => {
      const original = [{ a: 1 }, { b: 2 }];
      const clone = deepClone(original);

      expect(clone).toEqual(original);
      clone[0]!.a = 999;
      expect(original[0]!.a).toBe(1);
    });

    test('clones an empty array', () => {
      const original: number[] = [];
      const clone = deepClone(original);

      expect(clone).toEqual([]);
      expect(clone).not.toBe(original);
    });
  });

  describe('plain objects', () => {
    test('clones a flat object', () => {
      const original = { a: 1, b: 'two', c: true };
      const clone = deepClone(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
    });

    test('clones nested objects independently', () => {
      const original = { a: { b: { c: 1 } } };
      const clone = deepClone(original);

      expect(clone).toEqual(original);
      expect(clone.a).not.toBe(original.a);
      expect(clone.a.b).not.toBe(original.a.b);

      clone.a.b.c = 999;
      expect(original.a.b.c).toBe(1);
    });

    test('clones objects containing arrays and vice versa', () => {
      const original = { list: [1, { nested: true }], meta: { tags: ['a', 'b'] } };
      const clone = deepClone(original);

      expect(clone).toEqual(original);
      expect(clone.list).not.toBe(original.list);
      expect(clone.meta.tags).not.toBe(original.meta.tags);

      (clone.list[1] as { nested: boolean }).nested = false;
      expect((original.list[1] as { nested: boolean }).nested).toBe(true);
    });

    test('mutating the clone never affects the original, and vice versa', () => {
      const original = { a: 1, nested: { b: 2 } };
      const clone = deepClone(original);

      clone.a = 100;
      clone.nested.b = 200;
      expect(original.a).toBe(1);
      expect(original.nested.b).toBe(2);

      original.a = -1;
      original.nested.b = -2;
      expect(clone.a).toBe(100);
      expect(clone.nested.b).toBe(200);
    });

    test('preserves keys whose values are null or undefined', () => {
      const original = { a: null, b: undefined, c: 0, d: '' };
      const clone = deepClone(original);

      expect(clone).toEqual(original);
      expect('b' in clone).toBe(true);
    });
  });

  describe('built-in special objects', () => {
    test('clones a Date into a distinct instance with the same time value', () => {
      const original = new Date('2024-01-01T00:00:00.000Z');
      const clone = deepClone(original);

      expect(clone).not.toBe(original);
      expect(clone instanceof Date).toBe(true);
      expect(clone.getTime()).toBe(original.getTime());
    });

    test('clones a RegExp into a distinct instance with the same pattern and flags', () => {
      const original = /abc/gi;
      const clone = deepClone(original);

      expect(clone).not.toBe(original);
      expect(clone instanceof RegExp).toBe(true);
      expect(clone.source).toBe(original.source);
      expect(clone.flags).toBe(original.flags);
    });

    test('clones a Map into a distinct instance with deeply cloned entries', () => {
      const nested = { count: 1 };
      const original = new Map<string, unknown>([['key', nested]]);
      const clone = deepClone(original);

      expect(clone).not.toBe(original);
      expect(clone instanceof Map).toBe(true);
      expect(clone.get('key')).toEqual(nested);
      expect(clone.get('key')).not.toBe(nested);
    });

    test('clones a Set into a distinct instance with deeply cloned values', () => {
      const nested = { count: 1 };
      const original = new Set<unknown>([nested]);
      const clone = deepClone(original);

      expect(clone).not.toBe(original);
      expect(clone instanceof Set).toBe(true);
      const [clonedValue] = Array.from(clone.values());
      expect(clonedValue).toEqual(nested);
      expect(clonedValue).not.toBe(nested);
    });
  });

  describe('object identity for repeated references', () => {
    test('preserves the fact that two properties pointed to the same object', () => {
      const shared = { value: 1 };
      const original = { first: shared, second: shared };
      const clone = deepClone(original);

      expect(clone.first).toEqual(shared);
      expect(clone.first).toBe(clone.second);
      expect(clone.first).not.toBe(shared);
    });
  });

  describe('circular references', () => {
    test('clones an object that references itself without infinite looping', () => {
      type Circular = { self?: Circular; value: number };
      const original: Circular = { value: 1 };
      original.self = original;

      const clone = deepClone(original);

      expect(clone.value).toBe(1);
      expect(clone.self).toBe(clone);
      expect(clone).not.toBe(original);
    });

    test('clones two objects that reference each other', () => {
      type Node = { name: string; next?: Node };
      const a: Node = { name: 'a' };
      const b: Node = { name: 'b' };
      a.next = b;
      b.next = a;

      const clone = deepClone(a);

      expect(clone.name).toBe('a');
      expect(clone.next?.name).toBe('b');
      expect(clone.next?.next).toBe(clone);
    });
  });

  describe('class instances', () => {
    test('preserves the prototype chain of a custom class', () => {
      class Point {
        constructor(public x: number, public y: number) {}
        distanceFromOrigin() {
          return Math.sqrt(this.x ** 2 + this.y ** 2);
        }
      }

      const original = new Point(3, 4);
      const clone = deepClone(original);

      expect(clone).not.toBe(original);
      expect(clone instanceof Point).toBe(true);
      expect(clone.distanceFromOrigin()).toBe(5);

      clone.x = 0;
      expect(original.x).toBe(3);
    });

    test('preserves null-prototype objects', () => {
      const original = Object.create(null);
      original.a = { b: 1 };

      const clone = deepClone(original);

      expect(Object.getPrototypeOf(clone)).toBe(null);
      expect(clone.a).toEqual({ b: 1 });
      expect(clone.a).not.toBe(original.a);
    });
  });

  describe('symbols', () => {
    test('clones symbol-keyed properties deeply', () => {
      const sym = Symbol('key');
      const original = { [sym]: { nested: 1 } };
      const clone = deepClone(original);

      expect(clone[sym]).toEqual({ nested: 1 });
      expect(clone[sym]).not.toBe(original[sym]);
    });

    test('returns symbol values as-is', () => {
      const sym = Symbol('value');

      expect(deepClone(sym)).toBe(sym);
      expect(deepClone({ sym }).sym).toBe(sym);
    });
  });

  describe('property descriptors', () => {
    test('preserves non-enumerable properties as non-enumerable', () => {
      const original = {};
      Object.defineProperty(original, 'hidden', {
        value: { deep: 1 },
        enumerable: false,
        writable: true,
        configurable: true,
      });

      const clone = deepClone(original) as { hidden: { deep: number } };
      const descriptor = Object.getOwnPropertyDescriptor(clone, 'hidden')!;

      expect(descriptor.enumerable).toBe(false);
      expect(clone.hidden).toEqual({ deep: 1 });
      expect(clone.hidden).not.toBe((original as typeof clone).hidden);
    });

    test('preserves writable and configurable flags', () => {
      const original = {};
      Object.defineProperty(original, 'fixed', {
        value: 1,
        enumerable: true,
        writable: false,
        configurable: false,
      });

      const descriptor = Object.getOwnPropertyDescriptor(
        deepClone(original),
        'fixed',
      )!;

      expect(descriptor.writable).toBe(false);
      expect(descriptor.configurable).toBe(false);
      expect(descriptor.enumerable).toBe(true);
    });

    test('copies getters and setters as accessors without invoking them', () => {
      const getter = jest.fn(function (this: { _v: number }) {
        return this._v;
      });
      const setter = jest.fn(function (this: { _v: number }, v: number) {
        this._v = v;
      });
      const original = { _v: 1 };
      Object.defineProperty(original, 'v', {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true,
      });

      const clone = deepClone(original) as { _v: number; v: number };
      const descriptor = Object.getOwnPropertyDescriptor(clone, 'v')!;

      expect(getter).not.toHaveBeenCalled();
      expect(setter).not.toHaveBeenCalled();
      expect(typeof descriptor.get).toBe('function');
      expect(typeof descriptor.set).toBe('function');
      expect('value' in descriptor).toBe(false);

      clone.v = 5;
      expect(clone._v).toBe(5);
      expect(original._v).toBe(1);
    });
  });

  describe('functions', () => {
    test('copies functions by reference', () => {
      const fn = () => 1;
      const clone = deepClone({ fn });

      expect(clone.fn).toBe(fn);
    });
  });

  describe('circular and shared references in containers', () => {
    test('clones an array that contains itself', () => {
      const original: unknown[] = [1];
      original.push(original);

      const clone = deepClone(original);

      expect(clone).not.toBe(original);
      expect(clone[0]).toBe(1);
      expect(clone[1]).toBe(clone);
    });

    test('clones a Map and a Set that contain themselves', () => {
      const map = new Map<string, unknown>();
      map.set('self', map);
      const set = new Set<unknown>();
      set.add(set);

      const mapClone = deepClone(map);
      const setClone = deepClone(set);

      expect(mapClone).not.toBe(map);
      expect(mapClone.get('self')).toBe(mapClone);
      expect(setClone).not.toBe(set);
      expect(setClone.has(setClone)).toBe(true);
    });

    test('keeps two references to the same array as one clone', () => {
      const shared = [1, 2];
      const clone = deepClone({ a: shared, b: shared });

      expect(clone.a).toBe(clone.b);
      expect(clone.a).not.toBe(shared);
    });

    test('clones Map keys and keeps key/value identity consistent', () => {
      const key = { id: 1 };
      const original = new Map<object, unknown>([[key, key]]);
      const clone = deepClone(original);
      const [[clonedKey, clonedValue]] = Array.from(clone.entries()) as [
        [object, object],
      ];

      expect(clonedKey).not.toBe(key);
      expect(clonedKey).toEqual(key);
      expect(clonedKey).toBe(clonedValue);
    });
  });
});
