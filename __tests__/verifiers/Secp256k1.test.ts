import { secp256k1Verifier } from '../../src/verifiers'
import { Bytes } from '../../src/types/Codables'

describe('secp256k1Verifier', () => {
  const publicKey = Bytes.fromHexString(
    '0x307836323733303630393061626142334136653134303065393334356243363063373861384245663537'
  )
  const message = Bytes.fromString('message')
  const signature = Bytes.fromHexString(
    '0x38e654295143721adf1e23753c82899022ad3742e33e2472068f1612736b537576f1406b3fc372ff081d5a5785bdc453afbdc5ac07eff710796a06c69a786f9b1c'
  )
  const invalidSignature = Bytes.fromHexString(
    '0x258be95aa1b4b86ca2a931bc95a648b2be79e8002e93ea4ffb416ad526b676a87e1776ebe8b0ea861b4e797c82023146de0b930b86ea49aa0fb2b9fcc5f30b931b'
  )
  const emptySignature = Bytes.default()

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

  it('throw exception with empty signature', async () => {
    expect(() => {
      secp256k1Verifier.verify(message, emptySignature, publicKey)
    }).toThrow(new Error('invalid signature'))
  })
})
