import {
  AtomicPredicate,
  LogicalConnective,
  Property
} from '../../../src/ovm/types'
import { Bytes } from '../../../src/types/Codables'
import { OrDecider } from '../../../src/ovm/deciders'
import { MockDeciderManager } from '../mocks/MockDeciderManager'
import { encodeProperty } from '../../../src/ovm/helpers'
import JsonCoder from '../../../src/coder'

describe('OrDecider', () => {
  const deciderManager = new MockDeciderManager()
  const NotDeciderAddress = deciderManager.getDeciderAddress(
    LogicalConnective.Not
  )
  const AndDeciderAddress = deciderManager.getDeciderAddress(
    LogicalConnective.And
  )
  const BoolDeciderAddress = deciderManager.getDeciderAddress(
    AtomicPredicate.Bool
  )
  const trueProperty = encodeProperty(
    JsonCoder,
    new Property(BoolDeciderAddress, [Bytes.fromString('true')])
  )
  const falseProperty = encodeProperty(
    JsonCoder,
    new Property(BoolDeciderAddress, [])
  )
  test('decide or(false, false) to false', async () => {
    const orDecier = new OrDecider()
    const decision = await orDecier.decide(deciderManager, [
      falseProperty,
      falseProperty
    ])
    expect(decision.outcome).toEqual(false)
    // valid challenge is And(Not(P0), Not(P1))
    expect(decision.challenges).toEqual([
      {
        property: new Property(AndDeciderAddress, [
          encodeProperty(
            JsonCoder,
            new Property(NotDeciderAddress, [falseProperty])
          ),
          encodeProperty(
            JsonCoder,
            new Property(NotDeciderAddress, [falseProperty])
          )
        ]),
        challengeInput: null
      }
    ])
  })

  test('decide or(false, true) to true', async () => {
    const orDecier = new OrDecider()
    const decision = await orDecier.decide(deciderManager, [
      falseProperty,
      trueProperty
    ])
    expect(decision.outcome).toEqual(true)
  })

  test('decide or(true, false) to true', async () => {
    const orDecier = new OrDecider()
    const decision = await orDecier.decide(deciderManager, [
      trueProperty,
      falseProperty
    ])
    expect(decision.outcome).toEqual(true)
  })

  test('decide or(true, true) to true', async () => {
    const orDecier = new OrDecider()
    const decision = await orDecier.decide(deciderManager, [
      trueProperty,
      trueProperty
    ])
    expect(decision.outcome).toEqual(true)
  })

  test('decide to false if given non-property input type.', async () => {
    const orDecier = new OrDecider()
    const decision = await orDecier.decide(deciderManager, [
      Bytes.fromString('Hello')
    ])
    expect(decision.outcome).toEqual(false)
  })
})
