import { BigNumber, Range } from '@cryptoeconomicslab/primitives'
import Coder from '@cryptoeconomicslab/coder'
import { MockDeciderManager } from '../mocks/MockDeciderManager'
import { HasIntersectionDecider } from '../../src'
import { setupContext } from '@cryptoeconomicslab/context'
setupContext({ coder: Coder })

describe('HasIntersection', () => {
  const decider = new HasIntersectionDecider()
  const deciderManager = new MockDeciderManager()

  test('decide true', async () => {
    const decision = await decider.decide(deciderManager, [
      Coder.encode(new Range(BigNumber.from(0), BigNumber.from(10)).toStruct()),
      Coder.encode(new Range(BigNumber.from(4), BigNumber.from(15)).toStruct())
    ])

    expect(decision.outcome).toBeTruthy()
  })

  test('decide true: A is contained by B', async () => {
    const decision = await decider.decide(deciderManager, [
      Coder.encode(new Range(BigNumber.from(5), BigNumber.from(10)).toStruct()),
      Coder.encode(new Range(BigNumber.from(0), BigNumber.from(20)).toStruct())
    ])

    expect(decision.outcome).toBeTruthy()
  })

  test('decide true: B is contained by A', async () => {
    const decision = await decider.decide(deciderManager, [
      Coder.encode(new Range(BigNumber.from(0), BigNumber.from(20)).toStruct()),
      Coder.encode(new Range(BigNumber.from(5), BigNumber.from(10)).toStruct())
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
