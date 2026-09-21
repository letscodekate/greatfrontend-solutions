type ThrottleFunction<T extends any[]> = (...args: T) => any;

export default function throttle<T extends any[]>(
  func: ThrottleFunction<T>,
  wait: number,
): ThrottleFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function throttled(this: unknown, ...args: T) {
    if (!timer) {
      func.apply(this, args);

      timer = setTimeout(() => {
        timer = null;
      }, wait);
    }
  }

  return throttled;
}
