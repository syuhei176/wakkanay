import { Struct, Bytes } from '@cryptoeconomicslab/primitives'
import { Coder } from './Coder'

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
