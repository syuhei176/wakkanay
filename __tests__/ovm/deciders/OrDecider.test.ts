import { Property } from '../../../src/ovm/types'
import { Bytes } from '../../../src/types/Codables'
import {
  initializeDeciderManager,
  OrDeciderAddress,
  NotDeciderAddress,
  SampleDeciderAddress,
  AndDeciderAddress
} from '../helpers/initiateDeciderManager'
import { encodeProperty } from '../../../src/ovm/helpers'

describe('OrDecider', () => {
  const trueProperty = encodeProperty(
    new Property(SampleDeciderAddress, [Bytes.fromString('true')])
  )
  const falseProperty = encodeProperty(new Property(SampleDeciderAddress, []))
  const deciderManager = initializeDeciderManager()
  test('decide or(false, false) to false', async () => {
    const decision = await deciderManager.decide(
      new Property(OrDeciderAddress, [falseProperty, falseProperty])
    )
    expect(decision.outcome).toEqual(false)
    // valid challenge is And(Not(P0), Not(P1))
    expect(decision.challenges[0]).toEqual({
      property: new Property(AndDeciderAddress, [
        encodeProperty(new Property(NotDeciderAddress, [falseProperty])),
        encodeProperty(new Property(NotDeciderAddress, [falseProperty]))
      ]),
      challengeInput: null
    })
  })

  test('decide or(false, true) to true', async () => {
    const decision = await deciderManager.decide(
      new Property(OrDeciderAddress, [falseProperty, trueProperty])
    )
    expect(decision.outcome).toEqual(true)
    // valid challenge is And(Not(P0), Not(P1))
    expect(decision.challenges[0]).toEqual({
      property: new Property(AndDeciderAddress, [
        encodeProperty(new Property(NotDeciderAddress, [falseProperty])),
        encodeProperty(new Property(NotDeciderAddress, [trueProperty]))
      ]),
      challengeInput: null
    })
  })

  test('decide or(true, false) to true', async () => {
    const decision = await deciderManager.decide(
      new Property(OrDeciderAddress, [trueProperty, falseProperty])
    )
    expect(decision.outcome).toEqual(true)
    // valid challenge is And(Not(P0), Not(P1))
    expect(decision.challenges[0]).toEqual({
      property: new Property(AndDeciderAddress, [
        encodeProperty(new Property(NotDeciderAddress, [trueProperty])),
        encodeProperty(new Property(NotDeciderAddress, [falseProperty]))
      ]),
      challengeInput: null
    })
  })

  test('decide or(true, true) to true', async () => {
    const decision = await deciderManager.decide(
      new Property(OrDeciderAddress, [trueProperty, trueProperty])
    )
    expect(decision.outcome).toEqual(true)
  })

  test('decide to false if given non-property input type.', async () => {
    const decision = await deciderManager.decide(
      new Property(OrDeciderAddress, [Bytes.fromString('Hello')])
    )
    expect(decision.outcome).toEqual(false)
  })
})
