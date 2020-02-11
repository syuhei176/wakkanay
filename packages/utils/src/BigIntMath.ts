import JSBI from 'jsbi'

export const max = (a: JSBI, b: JSBI): JSBI => {
  if (JSBI.greaterThanOrEqual(a, b)) return a
  else return b
}
export const min = (a: JSBI, b: JSBI): JSBI => {
  if (JSBI.lessThanOrEqual(a, b)) return a
  else return b
}

/**
 * makeRanges makes array of nnumbers which are in certain range
 * it's hard to make array which has a large number of items. So, end - start must be SafeNumber size.
 * @param start start of range
 * @param end end of range
 */
export const makeRange = (start: JSBI, end: JSBI) =>
  Array.from({ length: Number(JSBI.subtract(end, start)) + 1 }, (v, k) =>
    JSBI.add(JSBI.BigInt(k), start)
  )
