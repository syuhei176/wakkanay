import { BigNumber, Range } from '@cryptoeconomicslab/primitives'
import Coder from '@cryptoeconomicslab/coder'
import { MockDeciderManager } from '../mocks/MockDeciderManager'
import { IsContainedDecider } from '../../src'
import { setupContext } from '@cryptoeconomicslab/context'
setupContext({ coder: Coder })

describe('IsContained', () => {
  const decider = new IsContainedDecider()
  const deciderManager = new MockDeciderManager()

  test('decide true', async () => {
    const decision = await decider.decide(deciderManager, [
      Coder.encode(new Range(BigNumber.from(5), BigNumber.from(10)).toStruct()),
      Coder.encode(new Range(BigNumber.from(0), BigNumber.from(20)).toStruct())
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

  test('decide false with intersection', async () => {
    const decision = await decider.decide(deciderManager, [
      Coder.encode(new Range(BigNumber.from(0), BigNumber.from(10)).toStruct()),
      Coder.encode(new Range(BigNumber.from(4), BigNumber.from(15)).toStruct())
    ])

    expect(decision.outcome).toBeFalsy()
  })
})
