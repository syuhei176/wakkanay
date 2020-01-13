import { Property } from './types'
import { Bytes } from '../types/Codables'
import { Coder } from '../coder'

export const decodeProperty = (coder: Coder, input: Bytes) =>
  Property.fromStruct(coder.decode(Property.getParamType(), input))
export const encodeProperty = (coder: Coder, property: Property) =>
  coder.encode(property.toStruct())
