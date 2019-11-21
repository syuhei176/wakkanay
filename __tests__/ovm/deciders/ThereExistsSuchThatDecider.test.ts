import Coder from '../../../src/coder'
import { Bytes, Integer } from '../../../src/types/Codables'
import {
  initializeDeciderManager,
  ThereExistsSuchThatDeciderAddress,
  LessThanDeciderAddress,
  GreaterThanDeciderAddress,
  LessThanQuantifierAddress
} from '../helpers/initiateDeciderManager'
import { Property, FreeVariable } from '../../../src/ovm/types'

describe('ThereExistsSuchThatDecider', () => {
  const upperBound = Coder.encode(Integer.from(2))
  const lowerBound = Coder.encode(Integer.from(10))
  const lessThanTwoProperty = Coder.encode(
    new Property(LessThanDeciderAddress, [
      upperBound,
      FreeVariable.from('n')
    ]).toStruct()
  )
  const greaterThanTenProperty = Coder.encode(
    new Property(GreaterThanDeciderAddress, [
      lowerBound,
      FreeVariable.from('n')
    ]).toStruct()
  )

  const deciderManager = initializeDeciderManager()

  test('ThereExists positive integer n of number less than 10 such that n is less than 2.', async () => {
    const upperBound = Coder.encode(Integer.from(10))
    const quantifier = Coder.encode(
      new Property(LessThanQuantifierAddress, [upperBound]).toStruct()
    )
    const property = new Property(ThereExistsSuchThatDeciderAddress, [
      quantifier,
      Bytes.fromString('n'),
      lessThanTwoProperty
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeTruthy()
  })

  test('ThereDoesNotExists positive integer n of number less than 5 such that n is greater than 10.', async () => {
    const upperBound = Coder.encode(Integer.from(5))
    const quantifier = Coder.encode(
      new Property(LessThanQuantifierAddress, [upperBound]).toStruct()
    )
    const property = new Property(ThereExistsSuchThatDeciderAddress, [
      quantifier,
      Bytes.fromString('n'),
      greaterThanTenProperty
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeFalsy()
  })
})
