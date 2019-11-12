import { Property } from '../../src/ovm/types'
import { Bytes } from '../../src/types/Codables'
import EthCoder from '../../src/coder/EthCoder'
import {
  initializeDeciderManager,
  NotDeciderAddress,
  SampleDeciderAddress
} from './helpers/initiateDeciderManager'

describe('NotDecider', () => {
  const trueProperty = new Property(SampleDeciderAddress, [
    Bytes.fromString('true')
  ])
  const falseProperty = new Property(SampleDeciderAddress, [])
  const deciderManager = initializeDeciderManager()
  it('decide not(false)', async () => {
    const decision = await deciderManager.decide(
      new Property(NotDeciderAddress, [
        EthCoder.encode(falseProperty.toStruct())
      ])
    )
    expect(decision.outcome).toEqual(true)
  })
  it('decide not(true)', async () => {
    const decision = await deciderManager.decide(
      new Property(NotDeciderAddress, [
        EthCoder.encode(trueProperty.toStruct())
      ])
    )
    expect(decision.outcome).toEqual(false)
    // valid challenge is SampleDecider(true)
    expect(decision.challenges[0]).toEqual({
      challengeInput: null,
      property: trueProperty
    })
  })
})
