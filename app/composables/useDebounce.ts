// Debounce funkcia
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function debounced(...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return { debounced, cancel };
}

// Debounce ref s oneskorenim
export function useDebouncedRef(initialValue = "", delay = 300) {
  const value = ref(initialValue);
  const debounced = ref(initialValue);
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(value, (newVal) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      debounced.value = newVal;
    }, delay);
  });

  return { value, debounced };
}
