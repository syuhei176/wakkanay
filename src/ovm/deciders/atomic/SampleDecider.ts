import Coder from '../../../coder'
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
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
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
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
  ): Promise<Decision> {
    const upperBound = Coder.decode(Integer.default(), inputs[0])
    const n = Coder.decode(Integer.default(), inputs[1])
    return {
      outcome: upperBound.data > n.data,
      challenges: []
    }
  }
}

export class GreaterThanDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
  ): Promise<Decision> {
    const lowerBound = Coder.decode(Integer.default(), inputs[0])
    const n = Coder.decode(Integer.default(), inputs[1])
    return {
      outcome: lowerBound.data < n.data,
      challenges: []
    }
  }
}
