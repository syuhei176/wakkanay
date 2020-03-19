import { Bytes } from '@cryptoeconomicslab/primitives'
import { getWitnesses, isHint, replaceHint } from '@cryptoeconomicslab/db'
import { Decider } from '../../interfaces/Decider'
import { DeciderManager } from '../../DeciderManager'
import { Property, LogicalConnective } from '../../types'
import { TraceInfoCreator } from '../../Tracer'

/**
 * ThereExists decides property to true if any quantified value fulfill proposition.
 * inputs: Array<Bytes> [HintString, variableName, Property]
 */
export class ThereExistsSuchThatDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
  ) {
    const { coder } = ovmContext
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
      coder.decode(Property.getParamType(), inputs[2])
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
    const index = decisions.findIndex(d => d.outcome)
    const childTraceInfo = decisions.find(d => d.outcome === false)?.traceInfo
    const challenge = {
      challengeInput: null,
      property: new Property(
        manager.getDeciderAddress(LogicalConnective.ForAllSuchThat),
        [
          inputs[0],
          inputs[1],
          coder.encode(
            new Property(manager.getDeciderAddress(LogicalConnective.Not), [
              inputs[2]
            ]).toStruct()
          )
        ]
      )
    }

    if (index >= 0) {
      let nextWitnesses: Bytes[] | undefined = undefined
      const witness = witnesses[index]
      const childWitnesses = decisions[index].witnesses || []
      nextWitnesses = childWitnesses.concat([witness])
      return {
        outcome: true,
        witnesses: nextWitnesses,
        challenges: []
      }
    } else {
      return {
        outcome: false,
        witnesses: [],
        challenges: [challenge],
        traceInfo: childTraceInfo
          ? TraceInfoCreator.createThere(childTraceInfo)
          : undefined
      }
    }
  }
}
