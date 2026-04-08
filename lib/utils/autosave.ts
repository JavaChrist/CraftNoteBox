import debounce from "lodash.debounce";

export function createAutosave<T extends (...args: any[]) => any>(
  fn: T,
  delay = 800,
) {
  return debounce(fn, delay);
}

