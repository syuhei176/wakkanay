import { ed25519Verifier } from '../../src/verifier'
import { Bytes } from '@cryptoeconomicslab/primitives'

describe('ed25519Verifier', () => {
  const publicKey = Bytes.fromHexString(
    '0x6564706b7575474a34737348334e356b376f76776b42653136703872565831584c454e695a344641617972637755663973434b586e47'
  )
  const message = Bytes.fromString('message')
  const signature = Bytes.fromHexString(
    '0x677292276737c789d826e6e46fbcca4c768da3992074a68ab13d9e25e112c2075685c7a974fe0ab875bc8ac98f1cb3f2b0e053785f07ba608298b9e3389cf404'
  )
  const invalidSignature = Bytes.fromHexString(
    '0x011e58abd9fd95dfd8535f8aecc54a0dbd0cba924b0ee964487436e5ec3a38e16d174470801904d00245455e22f195685da02152f677ef8df78c931b494a220f'
  )
  const emptySignature = Bytes.default()

  it('return true with valid signature', async () => {
    const verify = await ed25519Verifier.verify(message, signature, publicKey)
    expect(verify).toBeTruthy()
  })

  it('return false with invalid signature', async () => {
    const verify = await ed25519Verifier.verify(
      message,
      invalidSignature,
      publicKey
    )
    expect(verify).toBeFalsy()
  })

  it('throw exception with empty signature', async () => {
    await expect(
      ed25519Verifier.verify(message, emptySignature, publicKey)
    ).rejects.toEqual(new Error('bad signature size'))
  })
})
