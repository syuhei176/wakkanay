import { Bytes } from '../../../types'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { IDeciderManager } from '../../interfaces/IDeciderManager'

export class SampleDecider implements Decider {
  public async decide(
    manager: IDeciderManager,
    inputs: Bytes[]
  ): Promise<Decision> {
    return {
      outcome: !!inputs[0],
      challenges: []
    }
  }
}
