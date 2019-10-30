import { Bytes } from '../../../types'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property } from '../../types'
import { IDeciderManager } from '../../interfaces/IDeciderManager'

export class NotDecider implements Decider {
  public async decide(
    manager: IDeciderManager,
    inputs: Bytes[]
  ): Promise<Decision> {
    const property = Property.decode(inputs[0])
    const decision = await manager.decide(property)
    return {
      outcome: !decision.outcome,
      challenges: [
        {
          property: property,
          challengeInput: null
        }
      ]
    }
  }
}
