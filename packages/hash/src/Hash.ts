import { Bytes } from '@cryptoeconomicslab/primitives'

export interface Hash {
  hash(preimage: Bytes): Bytes
}
