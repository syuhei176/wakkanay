import { Bytes } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'

/**
 * NotDecider recieves one input and returns logical negation of its decision.
 * If decision outcome is false, valid challenge is inner property.
 */
export class NotDecider implements Decider {
  public async decide(
    manager: DeciderManagerInterface,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
  ): Promise<Decision> {
    const property = Property.fromStruct(
      ovmContext.coder.decode(Property.getParamType(), inputs[0])
    )
    const decision = await manager.decide(property)
    return {
      outcome: !decision.outcome,
      challenges: [
        {
          property: property,
          challengeInput: null
        }
      ],
      traceInfo: decision.outcome
        ? decision.traceInfo?.addTraceInfo('Not')
        : undefined
    }
  }
}
