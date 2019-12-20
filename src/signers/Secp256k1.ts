import { joinSignature, arrayify, keccak256, SigningKey } from 'ethers/utils'
import { Bytes } from '../types/Codables'
import Signer from './Signer'

export const secp256k1Signer: Signer = {
  async sign(message: Bytes, privateKey: Bytes) {
    // private key is 32 bytes
    if (privateKey.data.byteLength != 32) {
      throw new Error('invalid length of privateKey')
    }
    const signingKey = new SigningKey(arrayify(privateKey.data))
    return Bytes.fromHexString(
      joinSignature(
        signingKey.signDigest(arrayify(keccak256(arrayify(message.data))))
      )
    )
  }
}
