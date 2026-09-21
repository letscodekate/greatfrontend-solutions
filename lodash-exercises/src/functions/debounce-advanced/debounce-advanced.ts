interface DebouncedFunction<This, Args extends unknown[]> {
  (this: This, ...args: Args): void;
  cancel: () => void;
  flush: () => void;
}

export default function debounce<This, Args extends unknown[]>(
  func: (this: This, ...args: Args) => unknown,
  wait?: number,
): DebouncedFunction<This, Args> {
  let currentTimer: ReturnType<typeof setTimeout> | undefined;
  let pending: { context: This; args: Args } | undefined;

  function cancel(): void {
    clearTimeout(currentTimer);
    currentTimer = undefined;
    pending = undefined;
  }

  function flush(): void {
    if (!pending) {
      return;
    }

    const { context, args } = pending;

    cancel();
    func.apply(context, args);
  }

  function debouncedFunction(this: This, ...args: Args): void {
    clearTimeout(currentTimer);

    pending = { context: this, args };
    currentTimer = setTimeout(flush, wait);
  }

  return Object.assign(debouncedFunction, { cancel, flush });
}
