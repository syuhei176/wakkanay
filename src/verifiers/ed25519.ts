import sodiumsumo from 'libsodium-wrappers-sumo'
import { TezosMessageUtils } from 'conseiljs'
import SignatureVerifier from './signatureVerifier'
import { Bytes } from '../types/Codables'

export const ed25519Verifier: SignatureVerifier = {
  verify: async (message: Bytes, signature: Bytes, publicKey: Bytes) => {
    const sig = Buffer.from(signature.toHexString().slice(2), 'hex')
    const msg = Buffer.from(message.toHexString())
    const pk = TezosMessageUtils.writeKeyWithHint(
      publicKey.intoString(),
      'edpk'
    )

    await sodiumsumo.ready
    return sodiumsumo.crypto_sign_verify_detached(sig, msg, pk)
  }
}
