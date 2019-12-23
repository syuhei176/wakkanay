import { Bytes, Address } from '../../types'
import {
  Property,
  convertStringToLogicalConnective,
  convertStringToAtomicPredicate,
  FreeVariable,
  AtomicPredicateStrings,
  LogicalConnectiveStrings
} from '../types'
import { transpiler } from 'ovm-compiler'
import Coder from '../../coder'
import { replaceHint } from '../deciders/getWitnesses'
import { decodeStructable } from '../../utils/DecoderUtil'

/**
 * When we have a property below, We can use CompiledPredicate  class to make a property from predicate and concrete inputs.
 * `Test(a) = For all b such that Q(b): Bool(a) and Bool(b)`
 * CompiledPredicate.instantiate(address, name, inputs) creates a property from output of ovm-compiler.
 * We can get an instance of CompiledPredicate with source like
 * ```
 * const compiledPredicate = new CompiledPredicate(source)
 * ```
 * And it can instantiate property using Test.
 * ```
 * // For all b such that Q(b): Bool(10) and Bool(b)
 * compiledPredicate.instantiate('TestF', [10])
 * // Bool(10) and Bool(5)
 * compiledPredicate.instantiate('TestFA', [10, 5])
 * ```
 */
export class CompiledPredicate {
  compiled: transpiler.CompiledPredicate
  constructor(compiled: transpiler.CompiledPredicate) {
    this.compiled = compiled
  }

  /**
   * decompileProperty expands a compiled property to original property
   * @param compiledProperty source compiled property
   * @param predicateTable The mapping between shortname of predicates and its address
   * @returns original property
   */
  decompileProperty(
    compiledProperty: Property,
    predicateTable: ReadonlyMap<string, Address>
  ): Property {
    const name: string = compiledProperty.inputs[0].intoString()
    const c = this.compiled.contracts.find(c => c.definition.name == name)
    if (!c) {
      throw new Error(`cannot find ${name} in contracts`)
    }

    const predicateAddress = predicateTable.get(
      convertStringToLogicalConnective(c.definition
        .predicate as LogicalConnectiveStrings)
    )

    if (predicateAddress === undefined) {
      throw new Error(`predicateAddress ${c.definition.predicate} not found`)
    }

    return new Property(
      predicateAddress,
      c.definition.inputs.map((i, index) => {
        if (typeof i == 'string') {
          if (
            (c.definition.predicate == 'ForAllSuchThat' ||
              c.definition.predicate == 'ThereExistsSuchThat') &&
            index == 0
          ) {
            i = replaceHint(
              i,
              createSubstitutions(
                c.definition.inputDefs,
                compiledProperty.inputs
              )
            )
          }
          return Bytes.fromString(i)
        } else if (i.predicate.type == 'AtomicPredicate') {
          let atomicPredicateAddress: Address | undefined
          const atomicPredicate = convertStringToAtomicPredicate(i.predicate
            .source as AtomicPredicateStrings)
          if (atomicPredicate) {
            atomicPredicateAddress = predicateTable.get(atomicPredicate)
          } else {
            atomicPredicateAddress = compiledProperty.deciderAddress
          }
          if (atomicPredicateAddress === undefined) {
            throw new Error(`The address of ${i.predicate.source} not found.`)
          }
          return Coder.encode(
            this.createChildProperty(
              atomicPredicateAddress,
              i,
              compiledProperty.inputs
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

/**
 * create substitution map from key list and value list
 * @param inputDefs
 * @param inputs
 */
export const createSubstitutions = (
  inputDefs: string[],
  inputs: Bytes[]
): { [key: string]: Bytes } => {
  const result: { [key: string]: Bytes } = {}
  if (inputDefs.length != inputs.length) {
    throw new Error('The length of inputDefs and inputs must be same.')
  }
  inputDefs.forEach((def, index) => {
    result[def] = inputs[index]
  })
  return result
}

/**
 * constructInput return child property bytes of anInput.
 * This method is used for constructing new inputs of decompiled property.
 * @param anInput if children has items, anInput must be Property
 * @param children children are array of input indexed to return child
 */
export const constructInput = (anInput: Bytes, children: number[]): Bytes => {
  if (children.length == 0) {
    return anInput
  }
  const property = decodeStructable(Property, Coder, anInput)
  if (children[0] == -1) {
    // -1 means `.address`
    return Bytes.fromHexString(property.deciderAddress.data)
  } else {
    return constructInput(property.inputs[children[0]], children.slice(1))
  }
}
