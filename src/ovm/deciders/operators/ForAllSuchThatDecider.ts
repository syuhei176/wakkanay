import EthCoder from '../../../coder/EthCoder'
import { Bytes, Integer } from '../../../types/Codables'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, Challenge, LogicalConnective } from '../../types'
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
    const variableName = inputs[1].intoString()
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
        // Set new variable to propagate the variable to children
        const decision = await manager.decide(
          innerProperty,
          Object.assign(substitutions, { [variableName]: q })
        )
        if (decision.outcome) {
          return null
        }
        // If outcome is false, add new challenge object to call challenge method in UAC.
        const challenge: Challenge = {
          property: new Property(
            manager.getDeciderAddress(LogicalConnective.Not),
            [EthCoder.encode(innerProperty.toStruct())]
          ),
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
