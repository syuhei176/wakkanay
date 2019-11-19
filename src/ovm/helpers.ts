import { Property } from './types'
import Coder from '../coder'
import { Bytes } from '../types/Codables'

export const decodeProperty = (input: Bytes) =>
  Property.fromStruct(Coder.decode(Property.getParamType(), input))
export const encodeProperty = (property: Property) =>
  Coder.encode(property.toStruct())
