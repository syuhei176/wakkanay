import { Bytes } from '../../../types/Codables'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManager } from '../../DeciderManager'

const verifySignature = (
  message: Bytes,
  signature: Bytes,
  publicKey: Bytes
): boolean => {
  // TODO: use wallet verify signature method

  return true
}

/**
 * IsHashPreimageDecider decide if given string is preimage of hash
 * inputs are tuple of two elements. (hash, preimage)
 */
export class SignedByDecider implements Decider {
  public async decide(
    manager: DeciderManager,
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
      outcome: verifySignature(message, signature, publicKey),
      challenges: []
    }
  }
}
