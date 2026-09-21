export default function conformsTo<T>(
  object: Record<string, T>,
  source: Record<string, (value: T | undefined | null) => boolean>,
): boolean {
  return Object.entries(source).every(
    ([key, predicate]) => Object.hasOwn(object, key) && predicate(object[key]),
  );
}
