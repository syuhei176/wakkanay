import { DeciderManager } from '../../src/ovm/DeciderManager'
import { NotDecider, SampleDecider } from '../../src/ovm/deciders'
import { Property } from '../../src/ovm/types'

describe('NotDecider', () => {
  const SampleDeciderAddress = '1'
  const NotDeciderAddress = '2'
  it('decide not(false)', async () => {
    const deciderManager = new DeciderManager()
    deciderManager.setDecider(SampleDeciderAddress, new SampleDecider())
    deciderManager.setDecider(NotDeciderAddress, new NotDecider())
    const decision = await deciderManager.decide(
      new Property(NotDeciderAddress, [
        new Property(SampleDeciderAddress, []).encode()
      ])
    )
    expect(decision.outcome).toEqual(true)
  })
  it('decide not(true)', async () => {
    const deciderManager = new DeciderManager()
    deciderManager.setDecider(SampleDeciderAddress, new SampleDecider())
    deciderManager.setDecider(NotDeciderAddress, new NotDecider())
    const decision = await deciderManager.decide(
      new Property(NotDeciderAddress, [
        new Property(SampleDeciderAddress, ['true']).encode()
      ])
    )
    expect(decision.outcome).toEqual(false)
    // valid challenge is SampleDecider(true)
    expect(decision.challenges[0]).toEqual({
      challengeInput: null,
      property: { deciderAddress: SampleDeciderAddress, inputs: ['true'] }
    })
  })
})
