import { Bytes } from '../../../types'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, Challenge } from '../../types'
import { DeciderManager } from '../../DeciderManager'

/**
 * ForDecider recieves quantifier and property.
 */
export class ForDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[]
  ): Promise<Decision> {
    const quantifierProperty = Property.decode(inputs[0])
    const innerProperty = Property.decode(inputs[2])
    const quantifier = manager.getQuantifier(quantifierProperty.deciderAddress)
    if (quantifier) {
      const quantifiedResult = await quantifier.getAllQuantified(
        manager,
        quantifierProperty.inputs
      )
      // set variable inputs[1] quantifiedResult
      manager.decide(innerProperty)
    }
    return {
      outcome: true,
      challenges: []
    }
  }
}
