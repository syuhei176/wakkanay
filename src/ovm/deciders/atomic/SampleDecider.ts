import { Bytes } from '../../../types/Codables'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManager } from '../../DeciderManager'

/**
 * SampleDecider decide depending on first input.
 */
export class SampleDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[]
  ): Promise<Decision> {
    return {
      outcome: !!inputs[0],
      challenges: []
    }
  }
}
