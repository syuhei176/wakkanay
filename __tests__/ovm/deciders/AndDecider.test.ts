import { Property } from '../../../src/ovm/types'
import { Bytes, Integer } from '../../../src/types/Codables'
import EthCoder from '../../../src/coder/EthCoder'
import {
  initializeDeciderManager,
  AndDeciderAddress,
  NotDeciderAddress,
  SampleDeciderAddress
} from '../helpers/initiateDeciderManager'

describe('AndDecider', () => {
  const trueProperty = EthCoder.encode(
    new Property(SampleDeciderAddress, [Bytes.fromString('true')]).toStruct()
  )
  const falseProperty = EthCoder.encode(
    new Property(SampleDeciderAddress, []).toStruct()
  )
  const deciderManager = initializeDeciderManager()
  const challengeInput0 = EthCoder.encode(Integer.from(0))
  const challengeInput1 = EthCoder.encode(Integer.from(1))

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
      challengeInput: challengeInput1,
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
      challengeInput: challengeInput0,
      property: new Property(NotDeciderAddress, [falseProperty])
    })
  })
})
