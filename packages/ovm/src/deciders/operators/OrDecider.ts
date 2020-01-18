import { Bytes } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, LogicalConnective } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'
import { encodeProperty, decodeProperty } from '../../helpers'

export class OrDecider implements Decider {
  public async decide(
    manager: DeciderManagerInterface,
    inputs: Bytes[]
  ): Promise<Decision> {
    let properties: Array<Property>
    try {
      properties = inputs.map(i => decodeProperty(manager.coder, i))
    } catch (e) {
      return {
        outcome: false,
        challenges: []
      }
    }

    const decisions = await Promise.all(
      properties.map(async p => {
        return await manager.decide(p)
      })
    )

    if (decisions.some(d => d.outcome)) {
      return {
        outcome: true,
        challenges: []
      }
    }

    const challenge = {
      property: new Property(
        manager.getDeciderAddress(LogicalConnective.And),
        properties
          .map(
            p =>
              new Property(manager.getDeciderAddress(LogicalConnective.Not), [
                encodeProperty(manager.coder, p)
              ])
          )
          .map(i => encodeProperty(manager.coder, i))
      ),
      challengeInput: null
    }

    return {
      outcome: false,
      challenges: [challenge]
    }
  }
}
