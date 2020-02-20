import { Bytes } from '@cryptoeconomicslab/primitives'
import { getWitnesses, isHint, replaceHint } from '@cryptoeconomicslab/db'
import { Decider } from '../../interfaces/Decider'
import { DeciderManager } from '../../DeciderManager'
import { Property } from '../../types'
import { TraceInfoCreator } from '../../Tracer'

/**
 * ThereExists decides property to true if any quantified value fulfill proposition.
 */
export class ThereExistsSuchThatDecider implements Decider {
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
  ) {
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

    const decisions = await Promise.all(
      witnesses.map(async witness => {
        return await manager.decide(innerProperty, {
          ...substitutions,
          [variableName]: witness
        })
      })
    )
    const childTraceInfo = decisions.find(d => d.outcome === false)?.traceInfo
    return {
      outcome: decisions.some(d => d.outcome),
      challenges: [],
      traceInfo: childTraceInfo
        ? TraceInfoCreator.createThere(childTraceInfo)
        : undefined
    }
  }
}
