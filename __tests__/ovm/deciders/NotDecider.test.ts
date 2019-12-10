import { Property, AtomicPredicate } from '../../../src/ovm/types'
import { Bytes, Address } from '../../../src/types/Codables'
import Coder from '../../../src/coder'
import { NotDecider } from '../../../src/ovm/deciders'
import { MockDeciderManager } from '../mocks/MockDeciderManager'

describe('NotDecider', () => {
  const deciderManager = new MockDeciderManager()
  const BoolDeciderAddress = deciderManager.getDeciderAddress(
    AtomicPredicate.Bool
  )
  const trueProperty = new Property(BoolDeciderAddress, [
    Bytes.fromString('true')
  ])
  const falseProperty = new Property(BoolDeciderAddress, [])
  it('decide not(false)', async () => {
    const nodeDecider = new NotDecider()
    const decision = await nodeDecider.decide(deciderManager, [
      Coder.encode(falseProperty.toStruct())
    ])
    expect(decision.outcome).toEqual(true)
  })
  it('decide not(true)', async () => {
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
