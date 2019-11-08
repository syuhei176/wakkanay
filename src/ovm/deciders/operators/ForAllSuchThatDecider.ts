import EthCoder from '../../../coder/EthCoder'
import { Bytes, Integer } from '../../../types/Codables'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, Challenge } from '../../types'
import { DeciderManager } from '../../DeciderManager'

/**
 * ForDecider check quantifier and property.
 */
export class ForAllSuchThatDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
  ): Promise<Decision> {
    const quantifierProperty = Property.fromStruct(
      EthCoder.decode(Property.getParamType(), inputs[0])
    )
    const innerProperty = Property.fromStruct(
      EthCoder.decode(Property.getParamType(), inputs[2])
    )
    const quantifier = manager.getQuantifier(quantifierProperty.deciderAddress)
    if (!quantifier) {
      throw new Error('quantifier not found')
    }
    const quantified = await quantifier.getAllQuantified(
      manager,
      quantifierProperty.inputs
    )
    const falseDecisions = await Promise.all(
      quantified.quantifiedResult.map(async q => {
        substitutions[inputs[1].intoString()] = q
        const decision = await manager.decide(innerProperty, substitutions)
        if (decision.outcome) {
          return null
        }
        const challenge: Challenge = {
          property: new Property(manager.getDeciderAddress('Not'), [
            EthCoder.encode(innerProperty.toStruct())
          ]),
          challengeInput: q
        }
        return {
          outcome: false,
          challenges: [challenge].concat(decision.challenges)
        }
      })
    )
    const falseDecision = falseDecisions.filter(r => !!r)[0]
    if (falseDecision) {
      return falseDecision
    }
    return {
      outcome: true,
      challenges: []
    }
  }
}
