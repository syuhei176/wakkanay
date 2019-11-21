import { ed25519Verifier } from '../../src/verifiers'
import { Bytes } from '../../src/types/Codables'
import sodiumsumo from 'libsodium-wrappers-sumo'
import base58check from 'bs58check'

async function sign(msg: Buffer, key: any) {
  await sodiumsumo.ready
  const b = sodiumsumo.crypto_sign_detached(msg, key)
  return Buffer.from(b)
}

// utility function for tezos key management
function readPublicKey(hex: string): string {
  if (hex.length !== 66 && hex.length !== 68) {
    throw new Error(`Incorrect hex length, ${hex.length} to parse a key`)
  }

  let hint = hex.substring(0, 2)
  if (hint === '00') {
    // ed25519
    return base58check.encode(Buffer.from('0d0f25d9' + hex.substring(2), 'hex'))
  } else if (hint === '01' && hex.length === 68) {
    // secp256k1
    return base58check.encode(Buffer.from('03fee256' + hex.substring(2), 'hex'))
  } else if (hint === '02' && hex.length === 68) {
    // p256
    return base58check.encode(Buffer.from('03b28b7f' + hex.substring(2), 'hex'))
  } else {
    throw new Error('Unrecognized key type')
  }
}

// utility function for tezos key management
async function restoreKey(
  privateKey: string
): Promise<{ publicKey: string; privateKey: string }> {
  await sodiumsumo.ready

  const secretKey = base58check.decode(privateKey).slice(4)
  const seed = sodiumsumo.crypto_sign_ed25519_sk_to_seed(secretKey)
  // @ts-ignore
  const keys = sodiumsumo.crypto_sign_seed_keypair(seed, '')
  const publicKey = readPublicKey(
    `00${Buffer.from(keys.publicKey).toString('hex')}`
  )

  return { publicKey, privateKey }
}

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
    await sodiumsumo.ready

    const keyStore = await restoreKey(privateKey)
    publicKey = Bytes.fromString(keyStore.publicKey)
    const messageBuffer = Buffer.from(message.toHexString())
    const privateKeyBuffer = base58check.decode(privateKey).slice(4)
    const anotherPrivateKeyBuffer = base58check
      .decode(anotherPrivateKey)
      .slice(4)
    const signatureBuffer = await sign(messageBuffer, privateKeyBuffer)
    const invalidSignatureBuffer = await sign(
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
