import { Bytes, Address } from '@cryptoeconomicslab/primitives'
import { replaceHint } from '@cryptoeconomicslab/db'
import { decodeStructable } from '@cryptoeconomicslab/coder'
import { Parser } from '@cryptoeconomicslab/ovm-parser'
import {
  CompiledPredicate as TranspilerCompiledPredicate,
  NormalInput,
  AtomicProposition,
  LogicalConnective,
  IntermediateCompiledPredicate,
  transpile
} from '@cryptoeconomicslab/ovm-transpiler'
import { Property, FreeVariable } from '../types'

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
 * const propertyTestF = new Property(TestPredicateAddress, ['TestF', 10])
 * compiledPredicate.instantiate(propertyTestF)
 * // Bool(10) and Bool(5)
 * const propertyTestFA = new Property(TestPredicateAddress, ['TestFA', 10, 5])
 * compiledPredicate.instantiate(propertyTestFA)
 * ```
 */
export class CompiledPredicate {
  // compiled property
  compiled: TranspilerCompiledPredicate
  // original source code of property
  source: string | null = null

  constructor(
    readonly deployedAddress: Address,
    compiled: TranspilerCompiledPredicate,
    source?: string
  ) {
    this.compiled = compiled
    this.deployedAddress = deployedAddress
    if (source) {
      this.source = source
    }
  }

  static fromSource(
    deployedAddress: Address,
    source: string
  ): CompiledPredicate {
    const propertyParser = new Parser()
    return new CompiledPredicate(
      deployedAddress,
      transpile(propertyParser.parse(source), () => {
        throw new Error('')
      })[0],
      source
    )
  }

  getPredicateName(): string {
    return this.compiled.name
  }

  makeProperty(inputs: Bytes[]): Property {
    return new Property(this.deployedAddress, inputs)
  }

  /**
   * decompileProperty expands a compiled property to original property
   * @param compiledProperty source compiled property
   * @param predicateTable The mapping between shortname of predicates and its address
   * @returns original property
   */
  decompileProperty(
    compiledProperty: Property,
    predicateTable: ReadonlyMap<string, Address>,
    constantTable: { [key: string]: Bytes } = {}
  ): Property {
    const name: string = compiledProperty.inputs[0].intoString()
    const findContract = (name: string) => {
      return this.compiled.contracts.find(c => c.name == name)
    }

    let c = findContract(name)
    if (!c) {
      // If contract is not found, use entry point.
      c = findContract(this.compiled.entryPoint)
      compiledProperty.inputs.unshift(
        Bytes.fromString(this.compiled.entryPoint)
      )
    }
    if (c === undefined) {
      throw new Error(`cannot find ${name} in contracts`)
    }
    const def = c
    const context = {
      compiledProperty,
      predicateTable,
      constantTable
    }
    const predicateAddress = predicateTable.get(c.connective)

    if (predicateAddress === undefined) {
      throw new Error(`predicateAddress ${def.connective} not found`)
    }

    if (
      def.connective == LogicalConnective.ForAllSuchThat ||
      def.connective == LogicalConnective.ThereExistsSuchThat
    ) {
      const hint = def.inputs[0] as string
      return new Property(predicateAddress, [
        Bytes.fromString(
          replaceHint(
            hint,
            createSubstitutions(
              def.inputDefs,
              compiledProperty.inputs,
              parseHintToGetVariables(hint).map(parseVariable)
            )
          )
        ),
        Bytes.fromString(def.inputs[1] as string),
        createAtomicPropositionCall(
          def.inputs[2] as AtomicProposition,
          def,
          context
        )
      ])
    } else {
      // In case of And, Or, Not and other predicates
      return new Property(
        predicateAddress,
        def.inputs.map(i =>
          createAtomicPropositionCall(i as AtomicProposition, def, context)
        )
      )
    }
  }
}

export const createAtomicPropositionCall = (
  input: AtomicProposition,
  def: IntermediateCompiledPredicate,
  context: {
    compiledProperty: Property
    predicateTable: ReadonlyMap<string, Address>
    constantTable: { [key: string]: Bytes }
  }
): Bytes => {
  if (input.predicate.type == 'AtomicPredicateCall') {
    const originalAddress: Address = context.compiledProperty.deciderAddress
    // If the predicate name is not listed in AtomicPredicate enum, it's compiled predicate.
    let atomicPredicateAddress: Address | undefined
    if (input.predicate.source.indexOf(def.originalPredicateName) == 0) {
      // If input.predicate.source is "${originalPredicateName}TA2O"
      atomicPredicateAddress = originalAddress
    } else {
      atomicPredicateAddress = context.predicateTable.get(
        input.predicate.source
      )
    }
    if (atomicPredicateAddress === undefined) {
      throw new Error(`The address of ${input.predicate.source} not found.`)
    }
    return ovmContext.coder.encode(
      createChildProperty(
        atomicPredicateAddress,
        input,
        context.compiledProperty,
        context.constantTable
      ).toStruct()
    )
  } else if (input.predicate.type == 'InputPredicateCall') {
    const property = decodeStructable(
      Property,
      ovmContext.coder,
      context.compiledProperty.inputs[input.predicate.source.inputIndex]
    )
    const extraInputBytes = input.inputs.map(
      i => context.compiledProperty.inputs[(i as NormalInput).inputIndex]
    )
    property.inputs = property.inputs.concat(extraInputBytes)
    return ovmContext.coder.encode(property.toStruct())
  } else if (input.predicate.type == 'VariablePredicateCall') {
    // When predicateDef has VariablePredicate, inputs[1] must be variable name
    return FreeVariable.from(def.inputs[1] as string)
  } else {
    throw new Error('predicate must be atomic, input or variable.')
  }
}

/**
 * createChildProperty
 * @param atomicPredicateAddress
 * @param proposition
 * @param inputs
 */
const createChildProperty = (
  atomicPredicateAddress: Address,
  proposition: AtomicProposition,
  compiledProperty: Property,
  constantsTable: { [key: string]: Bytes }
): Property => {
  return new Property(
    atomicPredicateAddress,
    proposition.inputs.map(i => {
      if (i.type == 'NormalInput') {
        if (compiledProperty.inputs.length <= i.inputIndex) {
          throw new Error(
            `Property(${compiledProperty.deciderAddress}) don't have enough inputs.`
          )
        }
        return constructInput(compiledProperty.inputs[i.inputIndex], i.children)
      } else if (i.type == 'VariableInput') {
        return FreeVariable.from(i.placeholder)
      } else if (i.type == 'LabelInput') {
        return Bytes.fromString(i.label)
      } else if (i.type == 'ConstantInput') {
        const constVar = constantsTable[i.name]
        if (constVar === undefined) {
          throw new Error(`constant value ${i.name} not found.`)
        }
        return constantsTable[i.name]
      } else if (i.type == 'SelfInput') {
        return Bytes.fromHexString(compiledProperty.deciderAddress.data)
      } else {
        throw new Error(`${i} has unknow type`)
      }
    })
  )
}

/**
 * create substitution map from key list and value list
 * @param inputDefs key list
 * @param inputs value list
 */
export const createSubstitutions = (
  inputDefs: string[],
  inputs: Bytes[],
  propertyInputs: Array<{ name: string; children: number[] }>
): { [key: string]: Bytes } => {
  const result: { [key: string]: Bytes } = {}
  if (inputDefs.length != inputs.length) {
    throw new Error('The length of inputDefs and inputs must be same.')
  }
  inputDefs.forEach((def, index) => {
    result[def] = inputs[index]
  })
  propertyInputs
    .filter(propertyInput => propertyInput.children.length > 0)
    .forEach(propertyInput => {
      const inputIndex = inputDefs.findIndex(
        name => name === propertyInput.name
      )
      if (inputIndex < 0) {
        throw new Error(`invalid propertyInputs ${propertyInput.name}.`)
      }
      const key = propertyInput.name + '.' + propertyInput.children.join('.')
      result[key] = constructInput(inputs[inputIndex], propertyInput.children)
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
  const property = decodeStructable(Property, ovmContext.coder, anInput)
  if (children[0] == -1) {
    // -1 means `.address`
    return Bytes.fromHexString(property.deciderAddress.data)
  } else {
    return constructInput(property.inputs[children[0]], children.slice(1))
  }
}

/**
 * parseHintToGetVariables parses "aaa.${a}.${b.0}" to ["a", "b.0"]
 * @param hint
 */
export const parseHintToGetVariables = (hint: string): string[] => {
  const regStr = /\${([a-zA-Z_][a-zA-Z0-9_.]*)}/
  const matched = hint.match(new RegExp(regStr, 'g'))
  if (matched === null) {
    return []
  }
  return matched.map(i => {
    const matched = i.match(new RegExp(regStr))
    if (matched) {
      return matched[1]
    } else {
      throw new Error('unexpected item')
    }
  })
}

/**
 * parseVariable parses "aaa.0.1" to {name:"v", children: [0, 1]}
 * @param v
 */
export const parseVariable = (
  v: string
): { name: string; children: number[] } => {
  if (v.indexOf('.') < 0) {
    return {
      name: v,
      children: []
    }
  }
  const arr = v.split('.')
  return {
    name: arr[0],
    children: arr.slice(1).map(c => Number(c))
  }
}
