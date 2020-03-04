import tweetnacl from 'tweetnacl'
import SignatureVerifier from './SignatureVerifier'
import { Bytes } from '@cryptoeconomicslab/primitives'

export const ed25519Verifier: SignatureVerifier = {
  verify: async (message: Bytes, signature: Bytes, publicKey: Bytes) => {
    const publicKeyHeaderAndBody = publicKey.split(1)
    const [sig, msg, pk] = [
      signature,
      message,
      publicKeyHeaderAndBody[1]
    ].map(b => Buffer.from(b.toHexString().substr(2), 'hex'))
    return tweetnacl.sign.detached.verify(msg, sig, pk)
  }
}
