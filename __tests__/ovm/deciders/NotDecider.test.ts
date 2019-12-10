import { Property } from '../../../src/ovm/types'
import { Bytes, Address } from '../../../src/types/Codables'
import Coder from '../../../src/coder'
import { NotDecider } from '../../../src/ovm/deciders/operators/NotDecider'
import { MockDeciderManager } from '../mocks/MockDeciderManager'

describe('NotDecider', () => {
  const trueProperty = new Property(Address.default(), [
    Bytes.fromString('true')
  ])
  const falseProperty = new Property(Address.default(), [])
  it('decide not(false)', async () => {
    const deciderManager = new MockDeciderManager({
      outcome: false,
      challenges: []
    })
    const nodeDecider = new NotDecider()
    const decision = await nodeDecider.decide(deciderManager, [
      Coder.encode(falseProperty.toStruct())
    ])
    expect(decision.outcome).toEqual(true)
  })
  it('decide not(true)', async () => {
    const deciderManager = new MockDeciderManager({
      outcome: true,
      challenges: []
    })
    const nodeDecider = new NotDecider()
    const decision = await nodeDecider.decide(deciderManager, [
      Coder.encode(trueProperty.toStruct())
    ])
    expect(decision.outcome).toEqual(false)
    // valid challenge is SampleDecider(true)
    expect(decision.challenges).toEqual([
      {
        challengeInput: null,
        property: trueProperty
      }
    ])
  })
})
