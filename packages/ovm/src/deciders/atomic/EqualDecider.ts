import { Bytes } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'

/**
 * EqualDecider decides if given two inputs are equal
 */
export class EqualDecider implements Decider {
  public async decide(
    manager: DeciderManagerInterface,
    inputs: Bytes[]
  ): Promise<Decision> {
    if (inputs.length !== 2) {
      return {
        outcome: false,
        challenges: []
      }
    }

    return {
      outcome: inputs[0].equals(inputs[1]),
      challenges: []
    }
  }
}
