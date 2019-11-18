import { Bytes } from '../../../types/Codables'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManager } from '../../DeciderManager'
import { secp2561kVerifier } from '../../../verifiers'

/**
 * IsHashPreimageDecider decide if given string is preimage of hash
 * inputs are tuple of two elements. (hash, preimage)
 */
export class SignedByDecider implements Decider {
  public async decide(
    _manager: DeciderManager,
    inputs: Bytes[]
  ): Promise<Decision> {
    if (inputs.length !== 3) {
      return {
        outcome: false,
        challenges: []
      }
    }

    const [message, signature, publicKey] = inputs
    return {
      outcome: await secp2561kVerifier.verify(message, signature, publicKey),
      challenges: []
    }
  }
}
