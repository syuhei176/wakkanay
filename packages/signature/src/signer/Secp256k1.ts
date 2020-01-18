import { joinSignature, arrayify, keccak256, SigningKey } from 'ethers/utils'
import { Bytes } from '@cryptoeconomicslab/primitives'
import Signer from './Signer'

export default class Secp256k1Signer implements Signer {
  privateKey: Bytes

  constructor(privateKey: Bytes) {
    this.privateKey = privateKey
  }

  async sign(message: Bytes) {
    // private key is 32 bytes
    if (this.privateKey.data.byteLength != 32) {
      throw new Error('invalid length of privateKey')
    }
    const signingKey = new SigningKey(arrayify(this.privateKey.data))
    return Bytes.fromHexString(
      joinSignature(
        signingKey.signDigest(arrayify(keccak256(arrayify(message.data))))
      )
    )
  }
}
