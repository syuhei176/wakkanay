import { Bytes } from '@cryptoeconomicslab/primitives'
import { Decider } from '../interfaces/Decider'
import { Decision, Property } from '../types'
import { DeciderManager } from '../DeciderManager'
import { CompiledPredicate } from './CompiledPredicate'
import { ThereExistsSuchThatDecider } from '../deciders'

function constantSubstitutions(constantTable: { [key: string]: Bytes }) {
  return Object.keys(constantTable).reduce((acc, key) => {
    const newKey = `$${key}`
    return { ...acc, [newKey]: constantTable[key] }
  }, {})
}

export class CompiledDecider implements Decider {
  constructor(
    private predicateSource: CompiledPredicate,
    readonly constantTable: { [key: string]: Bytes } = {}
  ) {}
  public async decide(
    manager: DeciderManager,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes } = {}
  ): Promise<Decision> {
    const property = this.predicateSource.decompileProperty(
      new Property(this.predicateSource.deployedAddress, inputs),
      manager.shortnameMap,
      this.constantTable
    )
    return manager.decide(property, {
      ...substitutions,
      ...constantSubstitutions(this.constantTable)
    })
  }

  public decompile(manager: DeciderManager, inputs: Bytes[]) {
    return this.predicateSource.decompileProperty(
      new Property(this.predicateSource.deployedAddress, inputs),
      manager.shortnameMap,
      this.constantTable
    )
  }

  public recoverHint(inputs: Bytes[]): Bytes {
    return this.predicateSource.recoverHint(
      new Property(this.predicateSource.deployedAddress, inputs)
    )
  }
}
