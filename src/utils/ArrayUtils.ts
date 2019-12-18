/**
 * Return array over `size` elements of `arr`.
 * @param arr original array
 * @param size chunk size
 */
export function chunk<T extends any[]>(arr: T, size: number): T[] {
  return arr.reduce(
    (newarr, _, i) => (i % size ? newarr : [...newarr, arr.slice(i, i + size)]),
    [] as T[][]
  )
}

export const makeRange = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (v, k) => k + start)
