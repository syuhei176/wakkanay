import { Bytes } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'
import { Range } from '@cryptoeconomicslab/primitives'
import { decodeStructable } from '@cryptoeconomicslab/coder'
import JSBI from 'jsbi'

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
        challenge: null
      }
    }

    const first = decodeStructable(Range, ovmContext.coder, inputs[0])
    const second = decodeStructable(Range, ovmContext.coder, inputs[1])

    return {
      outcome:
        JSBI.greaterThanOrEqual(first.start.data, second.start.data) &&
        JSBI.lessThanOrEqual(first.end.data, second.end.data),
      challenge: null
    }
  }
}
