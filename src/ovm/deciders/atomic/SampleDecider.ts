import EthCoder from '../../../coder/EthCoder'
import { Bytes, Integer } from '../../../types/Codables'
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

export class LessThanDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[]
  ): Promise<Decision> {
    const upperBound = EthCoder.decode(Integer.default(), inputs[0])
    const n = EthCoder.decode(Integer.default(), inputs[1])
    return {
      outcome: upperBound > n,
      challenges: []
    }
  }
}
