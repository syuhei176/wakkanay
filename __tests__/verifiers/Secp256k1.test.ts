import * as ethers from 'ethers'
import { secp256k1Verifier } from '../../src/verifiers'
import { Bytes } from '../../src/types/Codables'

describe('secp256k1Verifier', () => {
  const privateKey =
    '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
  const anotherPrivateKey =
    '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f'
  const message = Bytes.fromString('message')
  let publicKey: Bytes
  let signature: Bytes
  let invalidSignature: Bytes
  beforeEach(async () => {
    const signingKey = new ethers.utils.SigningKey(privateKey)
    const anotherSigningKey = new ethers.utils.SigningKey(anotherPrivateKey)
    publicKey = Bytes.fromString(signingKey.address)
    signature = Bytes.fromHexString(
      ethers.utils.joinSignature(signingKey.signDigest(message.data))
    )
    invalidSignature = Bytes.fromHexString(
      ethers.utils.joinSignature(anotherSigningKey.signDigest(message.data))
    )
  })

  it('return true with valid signature', async () => {
    const verify = await secp256k1Verifier.verify(message, signature, publicKey)
    expect(verify).toBeTruthy()
  })

  it('return false with invalid signature', async () => {
    const verify = await secp256k1Verifier.verify(
      message,
      invalidSignature,
      publicKey
    )
    expect(verify).toBeFalsy()
  })
})
