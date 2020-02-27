import base58 from 'bs58check'
import tweetnacl from 'tweetnacl'
import SignatureVerifier from './SignatureVerifier'
import { Bytes } from '@cryptoeconomicslab/primitives'

export const ed25519Verifier: SignatureVerifier = {
  verify: async (message: Bytes, signature: Bytes, publicKey: Bytes) => {
    const sig = Buffer.from(signature.toHexString().slice(2), 'hex')
    const msg = Buffer.from(message.toHexString())
    const pk = base58.decode(publicKey.intoString()).slice(4)

    return tweetnacl.sign.detached.verify(msg, sig, pk)
  }
}
