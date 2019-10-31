import { DeciderManager } from '../../src/ovm/DeciderManager'
import { AndDecider, NotDecider, SampleDecider } from '../../src/ovm/deciders'
import { Property } from '../../src/ovm/types'

describe('AndDecider', () => {
  const SampleDeciderAddress = '1'
  const NotDeciderAddress = '2'
  const AndDeciderAddress = '3'
  const trueProperty = new Property(SampleDeciderAddress, ['true']).encode()
  const falseProperty = new Property(SampleDeciderAddress, []).encode()
  const deciderManager = new DeciderManager()
  deciderManager.setDecider(SampleDeciderAddress, new SampleDecider())
  deciderManager.setDecider(NotDeciderAddress, new NotDecider(), 'Not')
  deciderManager.setDecider(AndDeciderAddress, new AndDecider(), 'And')

  it('decide and(true, true)', async () => {
    const decision = await deciderManager.decide(
      new Property(AndDeciderAddress, [trueProperty, trueProperty])
    )
    expect(decision.outcome).toEqual(true)
  })
  it('decide and(true, false)', async () => {
    const decision = await deciderManager.decide(
      new Property(AndDeciderAddress, [trueProperty, falseProperty])
    )
    expect(decision.outcome).toEqual(false)
    // valid challenge is Not(SampleDecider(false))
    expect(decision.challenges[0]).toEqual({
      challengeInput: '1',
      property: new Property(NotDeciderAddress, [falseProperty])
    })
  })
  it('decide and(false, true)', async () => {
    const decision = await deciderManager.decide(
      new Property(AndDeciderAddress, [falseProperty, trueProperty])
    )
    expect(decision.outcome).toEqual(false)
    // valid challenge is Not(SampleDecider(false))
    expect(decision.challenges[0]).toEqual({
      challengeInput: '0',
      property: new Property(NotDeciderAddress, [falseProperty])
    })
  })
})
