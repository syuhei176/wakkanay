import { Bytes } from '@cryptoeconomicslab/primitives'
import { getWitnesses, isHint, replaceHint } from '@cryptoeconomicslab/db'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, Challenge, LogicalConnective } from '../../types'
import { DeciderManager } from '../../DeciderManager'
import { TraceInfoCreator } from '../../Tracer'
import { CompiledDecider } from '../../decompiler'

function recoverHint(manager: DeciderManager, inputs: Bytes[]): Bytes {
  const notProperty = Property.fromStruct(
    ovmContext.coder.decode(Property.getParamType(), inputs[2])
  )
  const innerProperty = Property.fromStruct(
    ovmContext.coder.decode(Property.getParamType(), notProperty.inputs[0])
  )
  const decider = manager.getDecider(innerProperty.deciderAddress)
  if (decider) {
    return (decider as CompiledDecider).recoverHint(innerProperty.inputs)
  } else {
    throw new Error('decider not found')
  }
}

/**
 * ForAllSuchThatDecider decides property to true if all quantified values fulfill proposition.
 * inputs:Array<Bytes> [HintString, variableName, Property]
 * ForAllSuchThatDecider never return witnesses.
 * If decision outcome is false, valid challenge of ForAllSuchThat is Not(P(variable)).
 * However, if "P(variable)" is not atomic proposition, ForAllSuchThatDecider should return valid challenge of "P(variable)".
 */
export class ForAllSuchThatDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
  ): Promise<Decision> {
    let witnesses: Bytes[]
    if (inputs[0].equals(Bytes.fromString(''))) {
      inputs[0] = recoverHint(manager, inputs)
    }

    if (!isHint(inputs[0])) {
      throw new Error('inputs[0] must be valid hint data.')
    }
    witnesses = await getWitnesses(
      manager.witnessDb,
      replaceHint(inputs[0].intoString(), substitutions)
    )

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
        let challenge: Challenge | null = null
        if (manager.isDecompiledProperty(innerProperty)) {
          if (decision.challenge === null) {
            throw new Error('decision.challenge must not be null.')
          }
          // if `innerProperty` is the property using CompiledPredicate, ForAllSuchThatDecider should return valid challenge of "innerProperty".
          challenge = {
            property: decision.challenge.property,
            challengeInputs: [q].concat(decision.challenge.challengeInputs)
          }
        } else {
          // If outcome is false, add new challenge object to call challenge method in UAC.
          challenge = {
            property: new Property(
              manager.getDeciderAddress(LogicalConnective.Not),
              [ovmContext.coder.encode(innerProperty.toStruct())]
            ),
            challengeInputs: [q]
          }
        }
        return {
          outcome: false,
          witnesses: undefined,
          challenge,
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
        witnesses: undefined,
        challenge: null
      }
    )
  }
}
