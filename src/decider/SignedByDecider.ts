import { IDecider } from './IDecider'
import { Bytes, IDecision } from '../types'

class SignedByDecider implements IDecider {
  /**
   *
   */
  public async decide(inputs: Bytes[]): Promise<IDecision> {
    return Promise.resolve({
      outcome: true
    })
  }
}
