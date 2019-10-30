import { DeciderManager } from '../../src/ovm/DeciderManager'
import { NotDecider, SampleDecider } from '../../src/ovm/deciders'
import { Property } from '../../src/ovm/types'

describe('NotDecider', () => {
  it('decide not(false)', async () => {
    const deciderManager = new DeciderManager()
    deciderManager.setDecider('1', new SampleDecider())
    deciderManager.setDecider('2', new NotDecider())
    const decision = await deciderManager.decide(
      new Property('2', [new Property('1', []).encode()])
    )
    expect(decision.outcome).toEqual(true)
  })
  it('decide not(true)', async () => {
    const deciderManager = new DeciderManager()
    deciderManager.setDecider('1', new SampleDecider())
    deciderManager.setDecider('2', new NotDecider())
    const decision = await deciderManager.decide(
      new Property('2', [new Property('1', ['true']).encode()])
    )
    expect(decision.outcome).toEqual(false)
    // valid challenge is SampleDecider(true)
    expect(decision.challenges[0]).toEqual({
      challengeInput: null,
      property: { deciderAddress: '1', inputs: ['true'] }
    })
  })
})
