import { Bytes } from '../../../types'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, Challenge } from '../../types'
import { DeciderManager } from '../../DeciderManager'

/**
 * OrDecider recieves multiple inputs and returns logical or of those decision.
 * If decision outcome is false, valid challenge is a negation of all inner properties.
 */
export class OrDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[]
  ): Promise<Decision> {
    const properties = inputs.map(input => Property.decode(input))
    const decisions = await Promise.all(
      properties.map(async p => {
        return await manager.decide(p)
      })
    )
    const outcome = decisions.reduce((acc, d) => acc || d.outcome, false)
    if (outcome) {
      return {
        outcome: true,
        challenges: []
      }
    } else {
      const notProperties = properties.map(p =>
        new Property(manager.getDeciderAddress('Not'), [p.encode()]).encode()
      )
      const challenge: Challenge = {
        property: new Property(manager.getDeciderAddress('And'), notProperties),
        challengeInput: null
      }
      return {
        outcome: false,
        challenges: [challenge]
      }
    }
  }
}
