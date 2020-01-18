import { BigNumber } from '@cryptoeconomicslab/primitives'
import Coder from '@cryptoeconomicslab/coder'
import { IsLessThanDecider } from '../../src'
import { MockDeciderManager } from '../mocks/MockDeciderManager'

describe('IsLessThanDecider', () => {
  const decider = new IsLessThanDecider()
  const deciderManager = new MockDeciderManager()

  test('decide true', async () => {
    const decision = await decider.decide(deciderManager, [
      Coder.encode(BigNumber.from(1)),
      Coder.encode(BigNumber.from(10))
    ])

    expect(decision.outcome).toBeTruthy()
  })

  test('decide false', async () => {
    const decision = await decider.decide(deciderManager, [
      Coder.encode(BigNumber.from(10)),
      Coder.encode(BigNumber.from(5))
    ])

    expect(decision.outcome).toBeFalsy()
  })
})
