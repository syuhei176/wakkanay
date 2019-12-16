import { Property, AtomicPredicate } from '../../../src/ovm/types'
import { BigNumber, Range } from '../../../src/types'
import Coder from '../../../src/coder'
import { initializeDeciderManager } from '../helpers/initiateDeciderManager'

describe('EqualDecider', () => {
  const deciderManager = initializeDeciderManager()
  const Addr = deciderManager.getDeciderAddress(AtomicPredicate.IsSameAmount)

  test('decide true', async () => {
    const property = new Property(Addr, [
      Coder.encode(new Range(BigNumber.from(0), BigNumber.from(10)).toStruct()),
      Coder.encode(new Range(BigNumber.from(10), BigNumber.from(20)).toStruct())
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeTruthy()
  })

  test('decide false', async () => {
    const property = new Property(Addr, [
      Coder.encode(new Range(BigNumber.from(0), BigNumber.from(10)).toStruct()),
      Coder.encode(new Range(BigNumber.from(10), BigNumber.from(15)).toStruct())
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeFalsy()
  })
})
