import { Bytes } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'
import { Range } from '@cryptoeconomicslab/primitives'
import { decodeStructable } from '@cryptoeconomicslab/coder'
import JSBI from 'jsbi'

/**
 * HasIntersection decides to true if for given two ranges,
 * first range and second range has intersection.
 */
export class HasIntersectionDecider implements Decider {
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

    const firstStart = first.start.data
    const firstEnd = first.end.data
    const secondStart = second.start.data
    const secondEnd = second.end.data

    const a =
      JSBI.greaterThanOrEqual(firstStart, secondStart) &&
      JSBI.lessThan(firstStart, secondEnd)
    const b =
      JSBI.greaterThanOrEqual(secondStart, firstStart) &&
      JSBI.lessThan(secondStart, firstEnd)

    return {
      outcome: a || b,
      challenge: null
    }
  }
}
