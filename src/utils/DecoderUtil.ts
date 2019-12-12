import { Struct, Bytes } from '../types/Codables'
import { Coder } from '../coder/Coder'

interface StructableType<T> {
  fromStruct(s: Struct): T
  getParamType(): Struct
}

export function decodeStructable<T>(
  S: StructableType<T>,
  coder: Coder,
  b: Bytes
): T {
  return S.fromStruct(coder.decode(S.getParamType(), b))
}
