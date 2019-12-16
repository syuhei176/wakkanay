import { Property, AtomicPredicate } from '../../../src/ovm/types'
import { BigNumber } from '../../../src/types'
import Coder from '../../../src/coder'
import { initializeDeciderManager } from '../helpers/initiateDeciderManager'

describe('IsLessThanDecider', () => {
  const deciderManager = initializeDeciderManager()
  const IsLessThanDeciderAddress = deciderManager.getDeciderAddress(
    AtomicPredicate.IsLessThan
  )

  test('decide true', async () => {
    const property = new Property(IsLessThanDeciderAddress, [
      Coder.encode(BigNumber.from(1)),
      Coder.encode(BigNumber.from(10))
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeTruthy()
  })

  test('decide false', async () => {
    const property = new Property(IsLessThanDeciderAddress, [
      Coder.encode(BigNumber.from(10)),
      Coder.encode(BigNumber.from(5))
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeFalsy()
  })
})
