import { DeciderManager } from '../../src/ovm/DeciderManager'
import { AndDecider, NotDecider, SampleDecider } from '../../src/ovm/deciders'
import { Property } from '../../src/ovm/types'
import { Address, Bytes, Integer } from '../../src/types/Codables'
import { utils } from 'ethers'
import EthCoder from '../../src/coder/EthCoder'

describe('AndDecider', () => {
  const SampleDeciderAddress = Address.from(
    '0x0000000000000000000000000000000000000001'
  )
  const NotDeciderAddress = Address.from(
    '0x0000000000000000000000000000000000000002'
  )
  const AndDeciderAddress = Address.from(
    '0x0000000000000000000000000000000000000003'
  )
  const trueProperty = Bytes.from(
    utils.arrayify(
      EthCoder.encode(
        new Property(
          SampleDeciderAddress,
          [Bytes.fromString('true')],
          []
        ).toStruct()
      )
    )
  )
  const falseProperty = Bytes.from(
    utils.arrayify(
      EthCoder.encode(new Property(SampleDeciderAddress, [], []).toStruct())
    )
  )
  const deciderManager = new DeciderManager()
  deciderManager.setDecider(SampleDeciderAddress, new SampleDecider())
  deciderManager.setDecider(NotDeciderAddress, new NotDecider(), 'Not')
  deciderManager.setDecider(AndDeciderAddress, new AndDecider(), 'And')
  const challengeInput0 = Bytes.from(
    utils.arrayify(EthCoder.encode(Integer.from(0)))
  )
  const challengeInput1 = Bytes.from(
    utils.arrayify(EthCoder.encode(Integer.from(1)))
  )

  it('decide and(true, true)', async () => {
    const decision = await deciderManager.decide(
      new Property(AndDeciderAddress, [], [trueProperty, trueProperty])
    )
    expect(decision.outcome).toEqual(true)
  })
  it('decide and(true, false)', async () => {
    const decision = await deciderManager.decide(
      new Property(AndDeciderAddress, [], [trueProperty, falseProperty])
    )
    expect(decision.outcome).toEqual(false)
    // valid challenge is Not(SampleDecider(false))
    expect(decision.challenges[0]).toEqual({
      challengeInput: challengeInput1,
      property: new Property(NotDeciderAddress, [], [falseProperty])
    })
  })
  it('decide and(false, true)', async () => {
    const decision = await deciderManager.decide(
      new Property(AndDeciderAddress, [], [falseProperty, trueProperty])
    )
    expect(decision.outcome).toEqual(false)
    // valid challenge is Not(SampleDecider(false))
    expect(decision.challenges[0]).toEqual({
      challengeInput: challengeInput0,
      property: new Property(NotDeciderAddress, [], [falseProperty])
    })
  })
})
