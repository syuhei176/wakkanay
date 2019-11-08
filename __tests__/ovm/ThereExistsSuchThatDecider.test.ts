import { DeciderManager } from '../../src/ovm/DeciderManager'
import {
  IsHashPreimageDecider,
  ThereExistsSuchThatDecider
} from '../../src/ovm/deciders'
import { Property, FreeVariable } from '../../src/ovm/types'
import { Address, Bytes } from '../../src/types/Codables'
import { keccak256 } from 'ethers/utils'
import { InMemoryKeyValueStore } from '../../src/db'
import Coder from '../../src/coder'

describe('ThereExistsSuchThatDecider', () => {
  const IsHashPreimageDeciderAddress = Address.from(
    '0x0000000000000000000000000000000000000001'
  )
  const ThereExistsSuchThatDeciderAddress = Address.from(
    '0x0000000000000000000000000000000000000002'
  )
  const PreimageQuantifierAddress = Address.from(
    '0x0000000000000000000000000000000000000003'
  )
  const deciderManager = new DeciderManager(
    new InMemoryKeyValueStore(Bytes.fromString('plasma_db'))
  )
  deciderManager.setDecider(
    IsHashPreimageDeciderAddress,
    new IsHashPreimageDecider()
  )
  deciderManager.setDecider(
    ThereExistsSuchThatDeciderAddress,
    new ThereExistsSuchThatDecider()
  )

  const preimage = Bytes.fromString('plasma is awesome!!')
  const hash = Bytes.fromString(keccak256(preimage.data))

  test('valid hash preimage', async () => {
    deciderManager.db
      .bucket(Bytes.fromString('preimage_db'))
      .put(Bytes.fromString('true_preimage'), preimage)

    const property = new Property(ThereExistsSuchThatDeciderAddress, [
      Coder.encode(IsHashPreimageDeciderAddress),
      Coder.encode(PreimageQuantifierAddress),
      hash,
      FreeVariable.from('0')
    ])

    const decision = await deciderManager.decide(property, {}, 0)
    expect(decision.outcome).toBeTruthy()
  })
})
