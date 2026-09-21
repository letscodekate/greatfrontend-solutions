export default function debounce<This, Args extends unknown[]>(
  func: (this: This, ...args: Args) => unknown,
  wait: number,
): (this: This, ...args: Args) => void {
  let currentTimer: ReturnType<typeof setTimeout> | null = null;

  function debouncedFunction(this: This, ...args: Args): void {
    if (currentTimer) {
      clearTimeout(currentTimer);
    }

    currentTimer = setTimeout(() => {
      currentTimer = null;
      func.apply(this, args);
    }, wait);
  }

  return debouncedFunction;
}
