import { getDefaultCoder } from '../../../coder'
const Coder = getDefaultCoder()
import { Decider } from '../../interfaces/Decider'
import { DeciderManager } from '../../DeciderManager'
import { Bytes } from '../../../types/Codables'
import { Property } from '../../types'
import getWitnesses, { isHint, replaceHint } from '../getWitnesses'

/**
 * ThereExists decides property to true if any quantified value fulfill proposition.
 */
export class ThereExistsSuchThatDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
  ) {
    let witnesses
    if (isHint(inputs[0])) {
      witnesses = await getWitnesses(
        manager.witnessDb,
        replaceHint(inputs[0].intoString(), substitutions)
      )
    } else {
      throw new Error('inputs[0] must be valid hint data.')
    }
    const innerProperty = Property.fromStruct(
      Coder.decode(Property.getParamType(), inputs[2])
    )
    const variableName = inputs[1].intoString()

    const decisions = await Promise.all(
      witnesses.map(async witness => {
        return await manager.decide(innerProperty, {
          ...substitutions,
          [variableName]: witness
        })
      })
    )

    return {
      outcome: decisions.some(d => d.outcome),
      challenges: []
    }
  }
}
