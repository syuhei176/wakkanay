import { splitSignature, recoverAddress } from 'ethers/utils'
import SignatureVerifier from './SignatureVerifier'
import { Bytes } from '../types/Codables'

export const secp256k1Verifier: SignatureVerifier = {
  verify: (message: Bytes, signature: Bytes, publicKey: Bytes) => {
    const sig = splitSignature(signature.toHexString())
    const addr = recoverAddress(message.toHexString(), sig)
    return Promise.resolve(
      addr.toLocaleLowerCase() === publicKey.intoString().toLocaleLowerCase()
    )
  }
}
