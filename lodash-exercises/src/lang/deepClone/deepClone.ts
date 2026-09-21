function getType<T>(value: T): string {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

function deepCloneWithCache<T>(value: T, seen: WeakMap<object, unknown>): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return seen.get(value) as T;
  }

  const input: unknown = value;

  switch (getType(value)) {
    case "date": {
      return new Date((input as Date).getTime()) as T;
    }

    case "regexp": {
      const { source, flags } = input as RegExp;

      return new RegExp(source, flags) as T;
    }

    case "map": {
      const clone = new Map<unknown, unknown>();

      seen.set(value, clone);

      (input as Map<unknown, unknown>).forEach((entryValue, key) => {
        clone.set(
          deepCloneWithCache(key, seen),
          deepCloneWithCache(entryValue, seen),
        );
      });

      return clone as T;
    }

    case "set": {
      const clone = new Set<unknown>();

      seen.set(value, clone);

      (input as Set<unknown>).forEach((item) => {
        clone.add(deepCloneWithCache(item, seen));
      });

      return clone as T;
    }

    case "array": {
      const clone: unknown[] = [];

      seen.set(value, clone);

      for (const item of input as unknown[]) {
        clone.push(deepCloneWithCache(item, seen));
      }

      return clone as T;
    }

    default: {
      const clone = Object.create(Object.getPrototypeOf(value));

      seen.set(value, clone);

      for (const key of Reflect.ownKeys(value)) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);

        if (!descriptor) {
          continue;
        }

        if ("value" in descriptor) {
          descriptor.value = deepCloneWithCache(descriptor.value, seen);
        }

        Object.defineProperty(clone, key, descriptor);
      }

      return clone;
    }
  }
}

export default function deepClone<T>(value: T): T {
  return deepCloneWithCache(value, new WeakMap());
}
