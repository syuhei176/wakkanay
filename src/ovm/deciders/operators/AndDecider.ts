import Coder from '../../../coder'
import { Bytes, Integer } from '../../../types/Codables'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, Challenge, LogicalConnective } from '../../types'
import { DeciderManager } from '../../DeciderManager'

/**
 * AndDecider recieves multiple inputs and returns logical and of those decision.
 * If decision outcome is false, valid challenge is a negation of a inner property.
 */
export class AndDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
  ): Promise<Decision> {
    const decisions = await Promise.all(
      inputs
        .map(input =>
          Property.fromStruct(Coder.decode(Property.getParamType(), input))
        )
        .map(async (p, index) => {
          const decision = await manager.decide(p)
          if (decision.outcome) {
            return null
          }
          const challenge: Challenge = {
            property: new Property(
              manager.getDeciderAddress(LogicalConnective.Not),
              [Coder.encode(p.toStruct())]
            ),
            challengeInput: Coder.encode(Integer.from(index))
          }
          return {
            outcome: false,
            challenges: [challenge].concat(decision.challenges)
          }
        })
    )
    const filteredDecisions = decisions.filter(r => !!r)
    if (filteredDecisions[0]) {
      return filteredDecisions[0]
    }
    return {
      outcome: true,
      challenges: []
    }
  }
}
