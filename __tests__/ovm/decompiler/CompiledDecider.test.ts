import { Property } from '../../../src/ovm/types'
import { Address, Bytes } from '../../../src/types/Codables'
import {
  initializeDeciderManager,
  ForAllSuchThatDeciderAddress,
  LessThanQuantifierAddress
} from '../helpers/initiateDeciderManager'
import { CompiledDecider, CompiledPredicate } from '../../../src/ovm/decompiler'
import Coder from '../../../src/coder'
import { testSource } from './TestSource'

describe('CompiledDecider', () => {
  const TestPredicateAddress = Address.from(
    '0x0250035000301010002000900380005700060001'
  )

  const deciderManager = initializeDeciderManager()

  test('decide a property using compiled predicate', async () => {
    // An instance of compiled predicate "TestF(TestF, 10)".
    const property = new Property(ForAllSuchThatDeciderAddress, [
      Coder.encode(
        new Property(LessThanQuantifierAddress, [
          Bytes.fromHexString('0x3130')
        ]).toStruct()
      ),
      Bytes.fromString('b'),
      Coder.encode(
        new Property(TestPredicateAddress, [
          Bytes.fromHexString('0x546573744641'),
          Bytes.fromHexString('0x5f5f5641524941424c455f5f62')
        ]).toStruct()
      )
    ])

    // Sets instance of CompiledDecider TestF
    deciderManager.setDecider(
      TestPredicateAddress,
      new CompiledDecider(
        TestPredicateAddress,
        new CompiledPredicate(testSource, deciderManager)
      )
    )

    // TestF calls TestFA during deciding
    const decision = await deciderManager.decide(property, {})

    expect(decision).toEqual({
      challenges: [],
      outcome: true
    })
  })
})
