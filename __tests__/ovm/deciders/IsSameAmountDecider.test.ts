import { BigNumber, Range } from '../../../src/types'
import Coder from '../../../src/coder'
import { IsSameAmountDecider } from '../../../src/ovm'
import { MockDeciderManager } from '../mocks/MockDeciderManager'

describe('IsSameAmount', () => {
  const decider = new IsSameAmountDecider()
  const deciderManager = new MockDeciderManager()

  test('decide true', async () => {
    const decision = await decider.decide(deciderManager, [
      Coder.encode(new Range(BigNumber.from(0), BigNumber.from(10)).toStruct()),
      Coder.encode(new Range(BigNumber.from(10), BigNumber.from(20)).toStruct())
    ])

    expect(decision.outcome).toBeTruthy()
  })

  test('decide false', async () => {
    const decision = await decider.decide(deciderManager, [
      Coder.encode(new Range(BigNumber.from(0), BigNumber.from(10)).toStruct()),
      Coder.encode(new Range(BigNumber.from(10), BigNumber.from(15)).toStruct())
    ])

    expect(decision.outcome).toBeFalsy()
  })
})
