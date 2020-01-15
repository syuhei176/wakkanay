import { Bytes, BigNumber } from '../../../types/Codables'
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
    const upperBound = BigNumber.fromHexString(inputs[0].toHexString())
    const n = BigNumber.fromHexString(inputs[1].toHexString())
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
    const lowerBound = BigNumber.fromHexString(inputs[0].toHexString())
    const n = BigNumber.fromHexString(inputs[1].toHexString())
    return {
      outcome: lowerBound.data < n.data,
      challenges: []
    }
  }
}
