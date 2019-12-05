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
        if (i.predicate.type == 'AtomicPredicate') {
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
            new Property(
              atomicPredicateAddress,
              i.inputs.map(i => {
                if (i.type == 'NormalInput') {
                  return inputs[i.inputIndex]
                } else {
                  return FreeVariable.from(i.placeholder)
                }
              })
            ).toStruct()
          )
        } else {
          throw new Error('predicate must be atomic')
        }
      })
    )
  }
}
