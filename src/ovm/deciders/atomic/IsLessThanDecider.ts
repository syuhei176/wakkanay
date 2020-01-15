import { Bytes, BigNumber } from '../../../types/Codables'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'

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

    const first = BigNumber.fromHexString(inputs[0].toHexString())
    const second = BigNumber.fromHexString(inputs[1].toHexString())

    return {
      outcome: first.data < second.data,
      challenges: []
    }
  }
}
