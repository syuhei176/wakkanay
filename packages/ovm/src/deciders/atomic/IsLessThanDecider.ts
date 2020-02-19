import { Bytes, BigNumber } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'
import JSBI from 'jsbi'

/**
 * LessThanDecider decides to true if first input is less than second input
 */
export class IsLessThanDecider implements Decider {
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

    const first = ovmContext.coder.decode(BigNumber.default(), inputs[0])
    const second = ovmContext.coder.decode(BigNumber.default(), inputs[1])

    return {
      outcome: JSBI.lessThan(first.data, second.data),
      challenges: []
    }
  }
}
