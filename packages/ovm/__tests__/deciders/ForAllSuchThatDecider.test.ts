import { Bytes, BigNumber } from '@cryptoeconomicslab/primitives'
import Coder from '@cryptoeconomicslab/coder'
import {
  initializeDeciderManager,
  NotDeciderAddress,
  ForAllSuchThatDeciderAddress,
  SampleDeciderAddress,
  LessThanDeciderAddress
} from '../helpers/initiateDeciderManager'
import { Property, FreeVariable } from '../../src'
import { setupContext } from '@cryptoeconomicslab/context'
setupContext({ coder: Coder })

describe('ForAllsuchThatDecider', () => {
  const zero = Coder.encode(BigNumber.from(0)).toHexString()
  const trueProperty = Coder.encode(
    new Property(SampleDeciderAddress, [Bytes.fromString('true')]).toStruct()
  )
  const falseProperty = Coder.encode(
    new Property(SampleDeciderAddress, []).toStruct()
  )
  const upperBound = Coder.encode(BigNumber.from(5))
  const placeholderedProperty = Coder.encode(
    new Property(LessThanDeciderAddress, [
      upperBound,
      FreeVariable.from('n')
    ]).toStruct()
  )
  const deciderManager = initializeDeciderManager()

  it('decide for all n such that n < 10: true', async () => {
    const upperBound = BigNumber.from(10)
    const hint = Bytes.fromString(
      `range,NUMBER,${zero}-${Coder.encode(upperBound).toHexString()}`
    )
    const property = new Property(ForAllSuchThatDeciderAddress, [
      hint,
      Bytes.fromString('n'),
      trueProperty
    ])
    const decision = await deciderManager.decide(property)
    expect(decision).toStrictEqual({
      outcome: true,
      challenges: []
    })
  })

  it('decide for all n such that n < 10: false', async () => {
    const upperBound = BigNumber.from(10)
    const hint = Bytes.fromString(
      `range,NUMBER,${zero}-${Coder.encode(upperBound).toHexString()}`
    )
    const property = new Property(ForAllSuchThatDeciderAddress, [
      hint,
      Bytes.fromString('n'),
      falseProperty
    ])
    const decision = await deciderManager.decide(property)
    expect(decision).toStrictEqual({
      outcome: false,
      challenges: [
        {
          property: new Property(NotDeciderAddress, [falseProperty]),
          challengeInput: Coder.encode(BigNumber.from(0))
        }
      ]
    })
  })

  it('decide for all n such that n < 2: n < 5', async () => {
    const upperBound = BigNumber.from(2)
    const hint = Bytes.fromString(
      `range,NUMBER,${zero}-${Coder.encode(upperBound).toHexString()}`
    )
    const property = new Property(ForAllSuchThatDeciderAddress, [
      hint,
      Bytes.fromString('n'),
      placeholderedProperty
    ])
    const decision = await deciderManager.decide(property)
    expect(decision).toStrictEqual({
      outcome: true,
      challenges: []
    })
  })

  it('decide for all n such that n < 10: n < 5', async () => {
    const upperBound = BigNumber.from(10)
    const hint = Bytes.fromString(
      `range,NUMBER,${zero}-${Coder.encode(upperBound).toHexString()}`
    )
    const property = new Property(ForAllSuchThatDeciderAddress, [
      hint,
      Bytes.fromString('n'),
      placeholderedProperty
    ])
    const decision = await deciderManager.decide(property)
    expect(decision).toStrictEqual({
      outcome: false,
      challenges: [
        {
          property: new Property(NotDeciderAddress, [placeholderedProperty]),
          // challengeInput is 5 because 5 < 5 is false
          challengeInput: Coder.encode(BigNumber.from(5))
        }
      ]
    })
  })

  it('fail to decide because of invalid hint data', async () => {
    const hint = Bytes.fromString('invalid hint string')
    const property = new Property(ForAllSuchThatDeciderAddress, [
      hint,
      Bytes.fromString('n'),
      placeholderedProperty
    ])
    await expect(deciderManager.decide(property)).rejects.toEqual(
      new Error('inputs[0] must be valid hint data.')
    )
  })
})
