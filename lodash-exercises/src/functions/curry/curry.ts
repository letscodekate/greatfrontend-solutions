export default function curry(func: Function): Function {

  if (func.length === 0) {
    return function (this: unknown, ...args: unknown[]) {
      return func.apply(this, args);
    };
  }

  function createCurried(
    collectedArgs: unknown[],
    capturedThis: unknown,
    hasCapturedThis: boolean,
  ) {
    return function (this: unknown, _arg?: unknown) {
      const thisValue = hasCapturedThis ? capturedThis : this;

      if (arguments.length === 0) {
        return createCurried(collectedArgs, thisValue, true);
      }

      const newArgs = [...collectedArgs, _arg];

      if (newArgs.length >= func.length) {
        return func.apply(thisValue, newArgs);
      }

      return createCurried(newArgs, thisValue, true);
    };
  }

  return createCurried([], undefined, false);
}
