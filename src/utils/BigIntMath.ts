export const max = (a: bigint, b: bigint): bigint => {
  if (a >= b) return a
  else return b
}
export const min = (a: bigint, b: bigint): bigint => {
  if (a <= b) return a
  else return b
}

export const makeRange = (start: bigint, end: bigint) =>
  Array.from({ length: Number(end - start) + 1 }, (v, k) => BigInt(k) + start)
