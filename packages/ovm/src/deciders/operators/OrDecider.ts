import { Bytes } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, LogicalConnective } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'
import { encodeProperty, decodeProperty } from '../../helpers'
import { DebugInfo } from '../../Debugger'

export class OrDecider implements Decider {
  public async decide(
    manager: DeciderManagerInterface,
    inputs: Bytes[]
  ): Promise<Decision> {
    let properties: Array<Property>
    try {
      properties = inputs.map(i => decodeProperty(ovmContext.coder, i))
    } catch (e) {
      return {
        outcome: false,
        challenges: [],
        debugInfo: DebugInfo.exception('Or connective has an invalid child.')
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
                encodeProperty(ovmContext.coder, p)
              ])
          )
          .map(i => encodeProperty(ovmContext.coder, i))
      ),
      challengeInput: null
    }

    return {
      outcome: false,
      challenges: [challenge],
      debugInfo: decisions[0].debugInfo?.addDebugInfo('Or')
    }
  }
}
