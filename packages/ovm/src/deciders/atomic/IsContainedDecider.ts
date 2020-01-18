import { Bytes } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'
import { Range } from '@cryptoeconomicslab/primitives'
import { decodeStructable } from '@cryptoeconomicslab/coder'

/**
 * IsContainedDecider decides to true if for given two ranges,
 * first range is contained by second range: first.start >= second.start && first.end <= second.end
 */
export class IsContainedDecider implements Decider {
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

    const first = decodeStructable(Range, manager.coder, inputs[0])
    const second = decodeStructable(Range, manager.coder, inputs[1])

    return {
      outcome:
        first.start.data >= second.start.data &&
        first.end.data <= second.end.data,
      challenges: []
    }
  }
}
