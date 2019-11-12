import Coder from '../../../coder'
import { Decider } from '../../interfaces/Decider'
import { DeciderManager } from '../../DeciderManager'
import { Bytes, Integer } from '../../../types/Codables'
import { Property } from '../../types'

/**
 * ThereExists decides property to true if any quantified value fulfill proposition.
 */
export class ThereExistsSuchThatDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
  ) {
    const quantifierProperty = Property.fromStruct(
      Coder.decode(Property.getParamType(), inputs[0])
    )
    const innerProperty = Property.fromStruct(
      Coder.decode(Property.getParamType(), inputs[2])
    )
    const variableName = inputs[1].intoString()

    // quantify data
    const quantifier = manager.getQuantifier(quantifierProperty.deciderAddress)
    if (!quantifier) {
      throw new Error('quantifier not found')
    }
    const quantified = await quantifier.getAllQuantified(
      manager,
      quantifierProperty.inputs
    )
    const decisions = await Promise.all(
      quantified.quantifiedResult.map(async q => {
        return await manager.decide(innerProperty, {
          ...substitutions,
          [variableName]: q
        })
      })
    )

    return {
      outcome: decisions.some(d => d.outcome),
      challenges: []
    }
  }
}
