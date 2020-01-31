import { Address, Bytes, BigNumber } from '@cryptoeconomicslab/primitives'
import { initializeDeciderManager } from '../helpers/initiateDeciderManager'
import { CompiledDecider, CompiledPredicate, Property } from '../../src'
import Coder from '@cryptoeconomicslab/coder'
import { testSource } from './TestSource'
import { setupContext } from '@cryptoeconomicslab/context'
setupContext({ coder: Coder })

describe('CompiledDecider', () => {
  const TestPredicateAddress = Address.from(
    '0x0250035000301010002000900380005700060001'
  )

  const deciderManager = initializeDeciderManager()

  test('decide a property using compiled predicate', async () => {
    // An instance of compiled predicate "TestF(TestF, 10)".
    const property = new Property(TestPredicateAddress, [
      Bytes.fromString('TestF'),
      Coder.encode(BigNumber.from(10))
    ])

    // Sets instance of CompiledDecider TestF
    const compiledPredicate = CompiledPredicate.fromSource(
      TestPredicateAddress,
      testSource,
      { zero: Coder.encode(BigNumber.from(0)).toHexString() }
    )
    const compiledDecider = new CompiledDecider(compiledPredicate)
    deciderManager.setDecider(TestPredicateAddress, compiledDecider)

    // TestF calls TestFA during deciding
    const decision = await compiledDecider.decide(
      deciderManager,
      property.inputs,
      {}
    )

    expect(decision).toEqual({
      challenges: [],
      outcome: true
    })
  })
})
