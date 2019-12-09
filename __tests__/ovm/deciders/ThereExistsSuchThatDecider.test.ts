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
import { secp256k1Verifier } from '../../../src/verifiers'

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
      '0x307836323733303630393061626142334136653134303065393334356243363063373861384245663537'
    )
    const message = Bytes.fromString('message')
    const signature = Bytes.fromHexString(
      '0x38e654295143721adf1e23753c82899022ad3742e33e2472068f1612736b537576f1406b3fc372ff081d5a5785bdc453afbdc5ac07eff710796a06c69a786f9b1c'
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
