import { DeciderManager } from '../../../src/ovm/DeciderManager'
import { IsHashPreimageDecider } from '../../../src/ovm/deciders'
import { Property } from '../../../src/ovm/types'
import { Address, Bytes } from '../../../src/types/Codables'
import { keccak256 } from 'ethers/utils'

describe('IsHashPreimageDecider', () => {
  const addr = Address.from('0x0000000000000000000000000000000000000001')
  const deciderManager = new DeciderManager()
  deciderManager.setDecider(addr, new IsHashPreimageDecider())

  const preimage = Bytes.fromString('plasma is awesome!!')
  const hash = Bytes.fromString(keccak256(preimage.data))

  test('valid hash preimage', async () => {
    const property = new Property(addr, [hash, preimage])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeTruthy()
  })

  test('invalid hash preimage', async () => {
    const property = new Property(addr, [
      hash,
      Bytes.fromString('falsey preimage')
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeFalsy()
  })

  test('input tuple length is invalid', async () => {
    const property = new Property(addr, [hash])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeFalsy()
  })
})
