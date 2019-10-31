import { DeciderManager } from '../../src/ovm/DeciderManager'
import {
  AndDecider,
  OrDecider,
  NotDecider,
  SampleDecider
} from '../../src/ovm/deciders'
import { Property } from '../../src/ovm/types'

describe('OrDecider', () => {
  const SampleDeciderAddress = '1'
  const NotDeciderAddress = '2'
  const AndDeciderAddress = '3'
  const OrDeciderAddress = '4'
  const trueProperty = new Property(SampleDeciderAddress, ['true']).encode()
  const falseProperty = new Property(SampleDeciderAddress, []).encode()
  const notFalseProperty = new Property(NotDeciderAddress, [
    falseProperty
  ]).encode()
  const deciderManager = new DeciderManager()
  deciderManager.setDecider(SampleDeciderAddress, new SampleDecider())
  deciderManager.setDecider(NotDeciderAddress, new NotDecider(), 'Not')
  deciderManager.setDecider(AndDeciderAddress, new AndDecider(), 'And')
  deciderManager.setDecider(OrDeciderAddress, new OrDecider(), 'Or')

  it('decide or(true, true)', async () => {
    const decision = await deciderManager.decide(
      new Property(OrDeciderAddress, [trueProperty, trueProperty])
    )
    expect(decision.outcome).toEqual(true)
  })
  it('decide or(true, false)', async () => {
    const decision = await deciderManager.decide(
      new Property(OrDeciderAddress, [trueProperty, falseProperty])
    )
    expect(decision.outcome).toEqual(true)
  })
  it('decide or(false, false)', async () => {
    const decision = await deciderManager.decide(
      new Property(OrDeciderAddress, [falseProperty, falseProperty])
    )
    expect(decision.outcome).toEqual(false)
    // valid challenge is Not(SampleDecider(false))
    expect(decision.challenges[0]).toEqual({
      challengeInput: null,
      property: new Property(AndDeciderAddress, [
        notFalseProperty,
        notFalseProperty
      ])
    })
  })
})
