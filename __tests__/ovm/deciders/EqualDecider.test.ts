import { Property, AtomicPredicate } from '../../../src/ovm/types'
import { BigNumber } from '../../../src/types'
import Coder from '../../../src/coder'
import { initializeDeciderManager } from '../helpers/initiateDeciderManager'

describe('EqualDecider', () => {
  const deciderManager = initializeDeciderManager()
  const EqualDeciderAddress = deciderManager.getDeciderAddress(
    AtomicPredicate.Equal
  )

  test('decide true', async () => {
    const property = new Property(EqualDeciderAddress, [
      Coder.encode(BigNumber.from(10)),
      Coder.encode(BigNumber.from(10))
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeTruthy()
  })

  test('decide false', async () => {
    const property = new Property(EqualDeciderAddress, [
      Coder.encode(BigNumber.from(1)),
      Coder.encode(BigNumber.from(10))
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeFalsy()
  })
})
