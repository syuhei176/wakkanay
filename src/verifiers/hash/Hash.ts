import { Bytes } from '../../types'

export interface Hash {
  hash(preimage: Bytes): Bytes
}
