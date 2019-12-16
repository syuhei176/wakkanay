import Coder from '../../../coder'
import { Bytes, BigNumber } from '../../../types/Codables'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManager } from '../../DeciderManager'

/**
 * LessThanDecider decides to true if first input is less than second input
 */
export class IsLessThanDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[]
  ): Promise<Decision> {
    if (inputs.length !== 2) {
      return {
        outcome: false,
        challenges: []
      }
    }

    const first = Coder.decode(BigNumber.default(), inputs[0])
    const second = Coder.decode(BigNumber.default(), inputs[1])

    return {
      outcome: first.raw < second.raw,
      challenges: []
    }
  }
}
