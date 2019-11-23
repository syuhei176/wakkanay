import { utils } from 'ethers'
import { Hash } from './Hash'
import { Bytes } from '../../types'

export const Keccak256: Hash = {
  hash: (preimage: Bytes) => {
    return Bytes.fromHexString(utils.keccak256(utils.arrayify(preimage.data)))
  }
}
