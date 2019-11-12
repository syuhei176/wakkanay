import { Bytes } from '../../../types/Codables'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManager } from '../../DeciderManager'
import { keccak256, Arrayish } from 'ethers/utils'

const verifyHashPreimage = (
  hash: Bytes,
  preimage: Bytes,
  hashF: (s: Arrayish) => string = keccak256
): boolean => {
  const hashString = hash.intoString()
  return hashF(preimage.data) === hashString
}

/**
 * IsHashPreimageDecider decide if given string is preimage of hash
 * inputs are tuple of two elements. (hash, preimage)
 */
export class IsHashPreimageDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[]
  ): Promise<Decision> {
    if (inputs.length !== 2) {
      return {
        outcome: false,
        challenges: []
      }
    }

    const [hash, preimage] = inputs
    return {
      outcome: verifyHashPreimage(hash, preimage),
      challenges: []
    }
  }
}
