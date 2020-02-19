import { Bytes } from '@cryptoeconomicslab/primitives'
import { keccak256 } from 'ethers/utils/keccak256'
import { arrayify } from 'ethers/utils/bytes'
import { Hash } from './Hash'

export const Keccak256: Hash = {
  hash: (preimage: Bytes) => {
    return Bytes.fromHexString(keccak256(arrayify(preimage.data)))
  }
}
