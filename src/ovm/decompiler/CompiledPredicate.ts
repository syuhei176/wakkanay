import { Bytes, Address } from '../../types'
import {
  Property,
  convertStringToLogicalConnective,
  convertStringToAtomicPredicate,
  FreeVariable
} from '../types'
import { transpiler } from 'ovm-compiler'
import { DeciderManager } from '../DeciderManager'
import Coder from '../../coder'

export class CompiledPredicate {
  compiled: transpiler.CompiledPredicate
  manager: DeciderManager
  constructor(compiled: transpiler.CompiledPredicate, manager: DeciderManager) {
    this.compiled = compiled
    this.manager = manager
  }
  instantiate(
    name: string,
    originalAddress: Address,
    inputs: Bytes[]
  ): Property {
    const c = this.compiled.contracts.find(c => c.definition.name == name)
    if (!c) {
      throw new Error('cannot find contract')
    }

    const predicateAddress = this.manager.getDeciderAddress(
      convertStringToLogicalConnective(c.definition.predicate)
    )

    return new Property(
      predicateAddress,
      c.definition.inputs.map(i => {
        if (typeof i == 'string') {
          return Bytes.fromString(i)
        } else if (i.predicate.type == 'AtomicPredicate') {
          let atomicPredicateAddress: Address
          const atomicPredicate = convertStringToAtomicPredicate(
            i.predicate.source
          )
          if (atomicPredicate) {
            atomicPredicateAddress = this.manager.getDeciderAddress(
              atomicPredicate
            )
          } else {
            atomicPredicateAddress = originalAddress
          }
          return Coder.encode(
            this.createChildProperty(
              atomicPredicateAddress,
              i,
              inputs
            ).toStruct()
          )
        } else {
          throw new Error('predicate must be atomic or string')
        }
      })
    )
  }

  /**
   * createProperty
   * @param atomicPredicateAddress
   * @param proposition
   * @param inputs
   */
  private createChildProperty(
    atomicPredicateAddress: Address,
    proposition: transpiler.AtomicProposition,
    inputs: Bytes[]
  ): Property {
    return new Property(
      atomicPredicateAddress,
      proposition.inputs.map(i => {
        if (i.type == 'NormalInput') {
          return inputs[i.inputIndex]
        } else if (i.type == 'VariableInput') {
          return FreeVariable.from(i.placeholder)
        } else if (i.type == 'LabelInput') {
          return Bytes.fromString(i.label)
        } else {
          throw new Error(`${i} has unknow type`)
        }
      })
    )
  }
}
