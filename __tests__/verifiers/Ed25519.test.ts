import {
  ConseilServerInfo,
  CryptoUtils,
  KeyStore,
  TezosConseilClient,
  TezosMessageUtils,
  TezosWalletUtil
} from 'conseiljs'
import { ed25519Verifier } from '../../src/verifiers'
import { Bytes } from '../../src/types/Codables'

describe('ed25519Verifier', () => {
  const privateKey =
    'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB'
  const anotherPrivateKey =
    'edskS5pf29PwnxHN7P7UhyR5t8mKsh3CiH86mAKZZ9E3Y46d1AULDk4N9CxugkeD5UAGvL7UyXVFRptSy439YT1jvMoGA8GMoR'
  let publicKey: Bytes
  const message = Bytes.fromString('message')
  let signature: Bytes
  let invalidSignature: Bytes
  beforeEach(async () => {
    const keyStore = await TezosWalletUtil.restoreIdentityWithSecretKey(
      privateKey
    )
    publicKey = Bytes.fromString(keyStore.publicKey)
    const messageBuffer = Buffer.from(message.toHexString())
    const privateKeyBuffer = TezosMessageUtils.writeKeyWithHint(
      privateKey,
      'edsk'
    )
    const anotherPrivateKeyBuffer = TezosMessageUtils.writeKeyWithHint(
      anotherPrivateKey,
      'edsk'
    )
    const signatureBuffer = await CryptoUtils.signDetached(
      messageBuffer,
      privateKeyBuffer
    )
    const invalidSignatureBuffer = await CryptoUtils.signDetached(
      messageBuffer,
      anotherPrivateKeyBuffer
    )
    signature = Bytes.from(signatureBuffer)
    invalidSignature = Bytes.from(invalidSignatureBuffer)
  })

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
})
