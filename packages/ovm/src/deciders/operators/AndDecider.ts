import { Bytes, Integer } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, Challenge, LogicalConnective } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'
import { decodeProperty } from '../../helpers'
import { TraceInfoCreator } from '../../Tracer'

/**
 * AndDecider recieves multiple inputs and returns logical and of those decision.
 * If decision outcome is false, valid challenge is a negation of a inner property.
 */
export class AndDecider implements Decider {
  public async decide(
    manager: DeciderManagerInterface,
    inputs: Bytes[]
  ): Promise<Decision> {
    let properties: Property[]
    try {
      properties = inputs.map(i => decodeProperty(ovmContext.coder, i))
    } catch (e) {
      return {
        outcome: false,
        challenges: [],
        traceInfo: TraceInfoCreator.exception(
          'And connective has an invalid child.'
        )
      }
    }

    const decisions = await Promise.all(
      properties.map(async (p: Property, index: number) => {
        const decision = await manager.decide(p)
        if (decision.outcome) {
          return null
        }
        const challenge: Challenge = {
          property: new Property(
            manager.getDeciderAddress(LogicalConnective.Not),
            [ovmContext.coder.encode(p.toStruct())]
          ),
          challengeInput: ovmContext.coder.encode(Integer.from(index))
        }
        return {
          outcome: false,
          challenges: [challenge].concat(decision.challenges),
          traceInfo: decision.traceInfo
            ? TraceInfoCreator.createAnd(index, decision.traceInfo)
            : undefined
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
