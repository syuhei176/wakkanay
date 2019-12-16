import Coder from '../../../coder'
import { Bytes } from '../../../types/Codables'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'
import { Range } from '../../../types'
import { DecoderUtil } from '../../../utils'

/**
 * IsSameAmountDecider decides to true if given two range is same amount (end - start)
 */
export class IsSameAmountDecider implements Decider {
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

    const first = DecoderUtil.decodeStructable(Range, Coder, inputs[0])
    const firstAmount = first.end.raw - first.start.raw
    const second = DecoderUtil.decodeStructable(Range, Coder, inputs[1])
    const secondAmount = second.end.raw - second.start.raw

    return {
      outcome: firstAmount === secondAmount,
      challenges: []
    }
  }
}
