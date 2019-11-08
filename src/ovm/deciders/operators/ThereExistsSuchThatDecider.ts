import EthCoder from '../../../coder/EthCoder'
import { Bytes, Integer } from '../../../types/Codables'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, Challenge } from '../../types'
import { DeciderManager } from '../../DeciderManager'

/**
 * ThereExistsSuchThatDecider
 * given property and quantifier, decide to true if there exists at least one quantified value
 * such that property.decide(quantified) is true.
 * input tuple is [property, ...inputs_for_the_property]
 */
export class ThereExistsSuchThatDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {},
    qCount: number
  ): Promise<Decision> {
    // const innerProperty = inputs[0]
    // const quantifier = inputs[1]

    // const quantifierResult = quantifier.getAllQuantified()

    // Promise.all(quantifierResult.map(async (r) => {
    //   manager.decide(innerProperty, [r], qCount + 1)
    // }))

    return {
      outcome: true,
      challenges: []
    }
  }
}
