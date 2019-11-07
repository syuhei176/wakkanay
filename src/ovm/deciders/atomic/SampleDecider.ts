import { Decider } from '../../interfaces/Decider'
import { Decision, Property } from '../../types'
import { DeciderManager } from '../../DeciderManager'

/**
 * SampleDecider decide depending on first input.
 */
export class SampleDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    property: Property
  ): Promise<Decision> {
    return {
      outcome: !!property.inputs[0],
      challenges: []
    }
  }
}
