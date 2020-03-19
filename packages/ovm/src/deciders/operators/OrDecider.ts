import { Bytes, Integer } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision, Property, LogicalConnective } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'
import { encodeProperty, decodeProperty } from '../../helpers'
import { TraceInfo, TraceInfoCreator } from '../../Tracer'

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
        witnesses: [],
        challenges: [],
        traceInfo: TraceInfoCreator.exception(
          'Or connective has an invalid child.'
        )
      }
    }

    const decisions = await Promise.all(
      properties.map(async p => {
        return await manager.decide(p)
      })
    )

    const index = decisions.findIndex(d => d.outcome)
    if (index >= 0) {
      const childWitnesses = decisions[index].witnesses || []
      return {
        outcome: true,
        witnesses: childWitnesses.concat([
          ovmContext.coder.encode(Integer.from(index))
        ]),
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
      witnesses: [],
      challenges: [challenge],
      traceInfo: TraceInfoCreator.createOr(
        decisions.map(d => d.traceInfo).filter(t => !!t) as TraceInfo[]
      )
    }
  }
}
