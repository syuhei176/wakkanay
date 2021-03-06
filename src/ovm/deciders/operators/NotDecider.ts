import { Bytes } from '../../../types/Codables'
import Coder from '../../../coder'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property } from '../../types'
import { DeciderManager } from '../../DeciderManager'

/**
 * NotDecider recieves one input and returns logical negation of its decision.
 * If decision outcome is false, valid challenge is inner property.
 */
export class NotDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
  ): Promise<Decision> {
    const property = Property.fromStruct(
      Coder.decode(Property.getParamType(), inputs[0])
    )
    const decision = await manager.decide(property)
    return {
      outcome: !decision.outcome,
      challenges: [
        {
          property: property,
          challengeInput: null
        }
      ]
    }
  }
}
