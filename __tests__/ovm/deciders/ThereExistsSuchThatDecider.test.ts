import EthCoder from '../../../src/coder/EthCoder'
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
  const upperBound = EthCoder.encode(Integer.from(2))
  const lowerBound = EthCoder.encode(Integer.from(10))
  const lessThanTwoProperty = EthCoder.encode(
    new Property(LessThanDeciderAddress, [
      upperBound,
      FreeVariable.from('n')
    ]).toStruct()
  )
  const greaterThanTenProperty = EthCoder.encode(
    new Property(GreaterThanDeciderAddress, [
      lowerBound,
      FreeVariable.from('n')
    ]).toStruct()
  )

  const deciderManager = initializeDeciderManager()

  test('ThereExists positive integer n of number less than 10 such that n is less than 2.', async () => {
    const upperBound = EthCoder.encode(Integer.from(10))
    const quantifier = EthCoder.encode(
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
    const upperBound = EthCoder.encode(Integer.from(5))
    const quantifier = EthCoder.encode(
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
