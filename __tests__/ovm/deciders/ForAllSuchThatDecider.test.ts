import { Property, FreeVariable } from '../../../src/ovm/types'
import { Bytes, Integer } from '../../../src/types/Codables'
import Coder from '../../../src/coder'
import {
  initializeDeciderManager,
  NotDeciderAddress,
  ForAllSuchThatDeciderAddress,
  SampleDeciderAddress,
  LessThanDeciderAddress,
  LessThanQuantifierAddress,
  AndDeciderAddress
} from '../helpers/initiateDeciderManager'

describe('ForAllsuchThatDecider', () => {
  const trueProperty = Coder.encode(
    new Property(SampleDeciderAddress, [Bytes.fromString('true')]).toStruct()
  )
  const falseProperty = Coder.encode(
    new Property(SampleDeciderAddress, []).toStruct()
  )
  const upperBound = Coder.encode(Integer.from(5))
  const placeholderedProperty = Coder.encode(
    new Property(LessThanDeciderAddress, [
      upperBound,
      FreeVariable.from('n')
    ]).toStruct()
  )
  const deciderManager = initializeDeciderManager()

  it('decide for all n such that n < 10: true', async () => {
    const upperBound = Coder.encode(Integer.from(10))
    const quantifier = Coder.encode(
      new Property(LessThanQuantifierAddress, [upperBound]).toStruct()
    )
    const property = new Property(ForAllSuchThatDeciderAddress, [
      quantifier,
      Bytes.fromString('n'),
      trueProperty
    ])
    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toEqual(true)
  })

  it('decide for all n such that n < 10: false', async () => {
    const upperBound = Coder.encode(Integer.from(10))
    const quantifier = Coder.encode(
      new Property(LessThanQuantifierAddress, [upperBound]).toStruct()
    )
    const property = new Property(ForAllSuchThatDeciderAddress, [
      quantifier,
      Bytes.fromString('n'),
      falseProperty
    ])
    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toEqual(false)
    expect(decision.challenges[0].challengeInput).toEqual(
      Coder.encode(Integer.from(0))
    )
    expect(decision.challenges[0].property.deciderAddress).toEqual(
      NotDeciderAddress
    )
  })

  it('decide for all n such that n < 2: n < 5', async () => {
    const upperBound = Coder.encode(Integer.from(2))
    const quantifier = Coder.encode(
      new Property(LessThanQuantifierAddress, [upperBound]).toStruct()
    )
    const property = new Property(ForAllSuchThatDeciderAddress, [
      quantifier,
      Bytes.fromString('n'),
      placeholderedProperty
    ])
    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toEqual(true)
  })

  it('decide for all n such that n < 10: n < 5', async () => {
    const upperBound = Coder.encode(Integer.from(10))
    const quantifier = Coder.encode(
      new Property(LessThanQuantifierAddress, [upperBound]).toStruct()
    )
    const property = new Property(ForAllSuchThatDeciderAddress, [
      quantifier,
      Bytes.fromString('n'),
      placeholderedProperty
    ])
    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toEqual(false)
    // challengeInput is 5 because 5 < 5 is false
    expect(decision.challenges[0].challengeInput).toEqual(
      Coder.encode(Integer.from(5))
    )
  })

  it('fail to decide because of invalid quantifier address', async () => {
    const quantifier = Coder.encode(
      new Property(AndDeciderAddress, [upperBound]).toStruct()
    )
    const property = new Property(ForAllSuchThatDeciderAddress, [
      quantifier,
      Bytes.fromString('n'),
      placeholderedProperty
    ])
    await expect(deciderManager.decide(property)).rejects.toEqual(
      new Error('quantifier not found')
    )
  })
})
