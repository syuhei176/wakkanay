import { ed25519Verifier } from '../../src/verifier'
import { Bytes } from '@cryptoeconomicslab/primitives'

describe('ed25519Verifier', () => {
  // This is publicKey of KeyStore from conceiljs
  // TezosMessageUtils.writePublicKey(txWallet.publicKey)
  const publicKey = Bytes.fromHexString(
    '0x00a5d9062611ca949bc96970f9324b6519f214fa8181aeffde8c0fa32c2f31270c'
  )
  const message = Bytes.fromString('message')
  const signature = Bytes.fromHexString(
    '0xb7baa7cc67e64f3ca9f677292d04fc766b0503805946b832e3d85acea62c608cce953639a39776b15802850ac94ff8a2012c34377387ab0322093341b9d1bd07'
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
