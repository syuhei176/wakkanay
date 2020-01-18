import { Bytes } from '@cryptoeconomicslab/primitives'
import { Coder } from '@cryptoeconomicslab/coder'
import { Property } from './types'

export const decodeProperty = (coder: Coder, input: Bytes) =>
  Property.fromStruct(coder.decode(Property.getParamType(), input))
export const encodeProperty = (coder: Coder, property: Property) =>
  coder.encode(property.toStruct())
