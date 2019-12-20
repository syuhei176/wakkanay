import { DeciderManager } from '../../../src/ovm/DeciderManager'
import { IsValidSignatureDecider } from '../../../src/ovm/deciders'
import { Property } from '../../../src/ovm/types'
import { Address, Bytes } from '../../../src/types/Codables'
import * as ethers from 'ethers'
import { secp256k1Signer } from '../../../src/signers/Secp256k1'
import { InMemoryKeyValueStore } from '../../../src/db'

describe('IsValidSignatureDecider', () => {
  const addr = Address.from('0x0000000000000000000000000000000000000001')
  const db = new InMemoryKeyValueStore(Bytes.fromString('test'))
  const deciderManager = new DeciderManager(db)
  deciderManager.setDecider(addr, new IsValidSignatureDecider())
  const wallet = ethers.Wallet.createRandom()
  let publicKey: string, privateKey: Bytes, message: Bytes, signature: Bytes

  beforeAll(async () => {
    publicKey = await wallet.getAddress()
    privateKey = Bytes.fromHexString(wallet.privateKey)
    message = Bytes.fromString('hello world')
    signature = await secp256k1Signer.sign(message, privateKey)
  })

  test('valid secp2561k signature', async () => {
    const property = new Property(addr, [
      message,
      signature,
      Bytes.fromHexString(Address.from(publicKey).raw),
      Bytes.fromString('secp256k1')
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeTruthy()
  })

  test('invalid signature preimage', async () => {
    const property = new Property(addr, [
      message,
      Bytes.fromString('hellohello'),
      Bytes.fromHexString(Address.from(publicKey).raw),
      Bytes.fromString('secp256k1')
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeFalsy()
  })

  test('invalid signature', async () => {
    const invalidSig = await secp256k1Signer.sign(
      Bytes.fromString('invalid sig'),
      privateKey
    )
    const property = new Property(addr, [
      message,
      invalidSig,
      Bytes.fromHexString(Address.from(publicKey).raw),
      Bytes.fromString('secp256k1')
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeFalsy()
  })

  test('different signature algorithm', async () => {
    const property = new Property(addr, [
      message,
      signature,
      Bytes.fromHexString(Address.from(publicKey).raw),
      Bytes.fromString('ed25519')
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeFalsy()
  })

  test('input tuple length is invalid', async () => {
    const property = new Property(addr, [message])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeFalsy()
  })
})
