import tweetnacl from 'tweetnacl'
import SignatureVerifier from './SignatureVerifier'
import { Bytes } from '@cryptoeconomicslab/primitives'

export const ed25519Verifier: SignatureVerifier = {
  verify: async (message: Bytes, signature: Bytes, publicKey: Bytes) => {
    const publicKeyHeaderAndBody = publicKey.split(1)
    const sig = Buffer.from(signature.toHexString().substr(2), 'hex')
    const msg = Buffer.from(message.toHexString().substr(2), 'hex')
    const pk = Buffer.from(
      publicKeyHeaderAndBody[1].toHexString().substr(2),
      'hex'
    )
    return tweetnacl.sign.detached.verify(msg, sig, pk)
  }
}
