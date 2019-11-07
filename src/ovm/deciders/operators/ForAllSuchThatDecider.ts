import EthCoder from '../../../coder/EthCoder'
import { Bytes, Integer } from '../../../types/Codables'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, Challenge } from '../../types'
import { DeciderManager } from '../../DeciderManager'

/**
 * ForDecider check quantifier and property.
 */
export class ForAllSuchThatDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[]
  ): Promise<Decision> {
    const quantifierProperty = Property.fromStruct(
      EthCoder.decode(Property.getParamType(), inputs[0].toHexString())
    )
    const innerProperty = Property.fromStruct(
      EthCoder.decode(Property.getParamType(), inputs[2].toHexString())
    )
    const quantifier = manager.getQuantifier(quantifierProperty.deciderAddress)
    if (quantifier) {
      const quantifiedResult = await quantifier.getAllQuantified(
        manager,
        quantifierProperty.inputs
      )
      // set variable inputs[1] quantifiedResult
      manager.decide(innerProperty)
    }
    return {
      outcome: true,
      challenges: []
    }
  }
}
