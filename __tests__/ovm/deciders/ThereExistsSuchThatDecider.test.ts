import Coder from '../../../src/coder'
import { Bytes, Integer } from '../../../src/types/Codables'
import {
  initializeDeciderManager,
  ThereExistsSuchThatDeciderAddress,
  LessThanDeciderAddress,
  GreaterThanDeciderAddress,
  LessThanQuantifierAddress,
  IsValidSignatureDeciderAddress
} from '../helpers/initiateDeciderManager'
import { Property, FreeVariable } from '../../../src/ovm/types'
import { DeciderManager } from '../../../src/ovm/DeciderManager'

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

  let deciderManager: DeciderManager
  beforeEach(async () => {
    deciderManager = initializeDeciderManager()
  })

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

  test('There exists signature in witness db', async () => {
    const sigBucket = await deciderManager.witnessDb.bucket(
      Bytes.fromString('sig')
    )
    const publicKey = Bytes.fromHexString(
      '0x6564706b7575474a34737348334e356b376f76776b42653136703872565831584c454e695a344641617972637755663973434b586e47'
    )
    const message = Bytes.fromString('message')
    const signature = Bytes.fromHexString(
      '0x677292276737c789d826e6e46fbcca4c768da3992074a68ab13d9e25e112c2075685c7a974fe0ab875bc8ac98f1cb3f2b0e053785f07ba608298b9e3389cf404'
    )
    await sigBucket.put(message, signature)
    const hint = `sig,KEY,${message.intoString()}`
    const property = new Property(ThereExistsSuchThatDeciderAddress, [
      Bytes.fromString(hint),
      Bytes.fromString('sig'),
      Coder.encode(
        new Property(IsValidSignatureDeciderAddress, [
          message,
          FreeVariable.from('sig'),
          publicKey,
          Bytes.fromString('secp256k1')
        ]).toStruct()
      )
    ])

    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toBeTruthy()
  })
})
