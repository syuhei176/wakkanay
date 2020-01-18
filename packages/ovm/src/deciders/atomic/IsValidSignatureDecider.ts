import { Bytes } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManager } from '../../DeciderManager'
import { getSignatureVerifier } from '@cryptoeconomicslab/signature'

/**
 * IsHashPreimageDecider decide if given message is validly signed with given publicKey
 * with given signature algorithm.
 * inputs are tuple of four elements. (message, signature, publicKey, algorithm)
 */
export class IsValidSignatureDecider implements Decider {
  public async decide(
    _manager: DeciderManager,
    inputs: Bytes[]
  ): Promise<Decision> {
    if (inputs.length !== 4) {
      return {
        outcome: false,
        challenges: []
      }
    }

    const [message, signature, publicKey, verifierKey] = inputs
    const verifier = getSignatureVerifier(verifierKey.intoString())
    let result
    try {
      result = await verifier.verify(message, signature, publicKey)
    } catch (e) {
      result = false
    }

    return {
      outcome: result,
      challenges: []
    }
  }
}
