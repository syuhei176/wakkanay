import { Bytes } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManager } from '../../DeciderManager'
import { Hash, Keccak256 } from '@cryptoeconomicslab/hash'

const verifyHashPreimage = (
  hash: Bytes,
  preimage: Bytes,
  hashF: Hash = Keccak256
): boolean => {
  return hashF.hash(preimage).equals(hash)
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
        challenge: null
      }
    }

    const [hash, preimage] = inputs
    return {
      outcome: verifyHashPreimage(hash, preimage),
      challenge: null
    }
  }
}
