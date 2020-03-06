import { Bytes, Address } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManager } from '../../DeciderManager'
import { getSignatureVerifier } from '@cryptoeconomicslab/signature'

/**
 * IsHashPreimageDecider decide if given message is validly signed with given publicKey
 * with given signature algorithm.
 * inputs: Array<Bytes> [message, signature, publicKey, algorithm]
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
    const pubkey = Bytes.fromHexString(
      ovmContext.coder.decode(Address.default(), publicKey).data
    )

    try {
      result = await verifier.verify(message, signature, pubkey)
    } catch (e) {
      result = false
    }

    return {
      outcome: result,
      challenges: []
    }
  }
}
