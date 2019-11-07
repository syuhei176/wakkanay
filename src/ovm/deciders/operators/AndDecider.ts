import EthCoder from '../../../coder/EthCoder'
import { Bytes, Integer } from '../../../types/Codables'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, Challenge } from '../../types'
import { DeciderManager } from '../../DeciderManager'
import { utils } from 'ethers'

/**
 * AndDecider recieves multiple inputs and returns logical and of those decision.
 * If decision outcome is false, valid challenge is a negation of a inner property.
 */
export class AndDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    property: Property
  ): Promise<Decision> {
    const decisions = await Promise.all(
      property.properties
        .map(input =>
          Property.fromStruct(
            EthCoder.decode(Property.getParamType(), input.toHexString())
          )
        )
        .map(async (p, index) => {
          const decision = await manager.decide(p)
          if (decision.outcome) {
            return null
          } else {
            const challenge: Challenge = {
              property: new Property(
                manager.getDeciderAddress('Not'),
                [],
                [Bytes.from(utils.arrayify(EthCoder.encode(p.toStruct())))]
              ),
              challengeInput: Bytes.from(
                utils.arrayify(EthCoder.encode(Integer.from(index)))
              )
            }
            return {
              outcome: false,
              challenges: [challenge].concat(decision.challenges)
            }
          }
        })
    )
    const filteredDecisions = decisions.filter(r => !!r)
    if (filteredDecisions[0]) {
      return filteredDecisions[0]
    }
    return {
      outcome: true,
      challenges: []
    }
  }
}
