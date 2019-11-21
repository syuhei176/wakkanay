import sodiumsumo from 'libsodium-wrappers-sumo'
import base58 from 'bs58check'
import SignatureVerifier from './SignatureVerifier'
import { Bytes } from '../types/Codables'

export const ed25519Verifier: SignatureVerifier = {
  verify: async (message: Bytes, signature: Bytes, publicKey: Bytes) => {
    const sig = Buffer.from(signature.toHexString().slice(2), 'hex')
    const msg = Buffer.from(message.toHexString())
    const pk = base58.decode(publicKey.intoString()).slice(4)

    await sodiumsumo.ready
    return sodiumsumo.crypto_sign_verify_detached(sig, msg, pk)
  }
}
