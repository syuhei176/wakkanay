import { Bytes } from '../../../types/Codables'
import EthCoder from '../../../coder/EthCoder'
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
    property: Property
  ): Promise<Decision> {
    const child = Property.fromStruct(
      EthCoder.decode(
        Property.getParamType(),
        property.properties[0].toHexString()
      )
    )
    const decision = await manager.decide(child)
    return {
      outcome: !decision.outcome,
      challenges: [
        {
          property: child,
          challengeInput: null
        }
      ]
    }
  }
}
