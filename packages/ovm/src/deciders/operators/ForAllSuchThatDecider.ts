import { Bytes } from '@cryptoeconomicslab/primitives'
import { getWitnesses, isHint, replaceHint } from '@cryptoeconomicslab/db'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, Challenge, LogicalConnective } from '../../types'
import { DeciderManager } from '../../DeciderManager'
import { TraceInfoCreator } from '../../Tracer'

/**
 * ForDecider check quantifier and property.
 * inputs:Array<Bytes> [HintString, variableName, Property]
 */
export class ForAllSuchThatDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
  ): Promise<Decision> {
    let witnesses: Bytes[]
    if (isHint(inputs[0])) {
      witnesses = await getWitnesses(
        manager.witnessDb,
        replaceHint(inputs[0].intoString(), substitutions)
      )
    } else {
      throw new Error('inputs[0] must be valid hint data.')
    }

    const innerProperty = Property.fromStruct(
      ovmContext.coder.decode(Property.getParamType(), inputs[2])
    )
    const variableName = inputs[1].intoString()

    const falseDecisions: Array<null | Decision> = await Promise.all(
      witnesses.map(async q => {
        // Set new variable to propagate the variable to children
        const decision = await manager.decide(
          innerProperty,
          Object.assign(substitutions, { [variableName]: q })
        )
        if (decision.outcome) {
          return null
        }
        // If outcome is false, add new challenge object to call challenge method in UAC.
        const challenge: Challenge = {
          property: new Property(
            manager.getDeciderAddress(LogicalConnective.Not),
            [ovmContext.coder.encode(innerProperty.toStruct())]
          ),
          challengeInput: q
        }
        return {
          outcome: false,
          challenges: [challenge].concat(decision.challenges),
          traceInfo: decision.traceInfo
            ? TraceInfoCreator.createFor(q, decision.traceInfo)
            : undefined
        }
      })
    )
    const falseDecision = falseDecisions.find(r => r !== null)
    return (
      falseDecision || {
        outcome: true,
        challenges: []
      }
    )
  }
}
