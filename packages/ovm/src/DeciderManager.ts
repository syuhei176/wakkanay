import { Address, Bytes } from '@cryptoeconomicslab/primitives'
import { KeyValueStore } from '@cryptoeconomicslab/db'
import JsonCoder, { Coder } from '@cryptoeconomicslab/coder'
import { Decider } from './interfaces/Decider'
import { Property, Decision, FreeVariable } from './types'
import { initialize, InitilizationConfig } from './load'
import { CompiledPredicate } from './decompiler'
import { TraceInfoCreator } from './Tracer'

export interface DeciderManagerInterface {
  readonly coder: Coder
  decide(
    property: Property,
    substitutions?: { [key: string]: Bytes }
  ): Promise<Decision>
  getDeciderAddress(shortname: string): Address
}

/**
 * DeciderManager manages deciders and its address
 */
export class DeciderManager implements DeciderManagerInterface {
  private deciders: Map<string, Decider>
  private shortnames: Map<string, Address>
  private compiledPredicates: Map<string, CompiledPredicate>
  public witnessDb: KeyValueStore
  constructor(witnessDb: KeyValueStore, readonly coder: Coder = JsonCoder) {
    this.witnessDb = witnessDb
    this.deciders = new Map<string, Decider>()
    this.shortnames = new Map<string, Address>()
    this.compiledPredicates = new Map<string, CompiledPredicate>()
  }

  /**
   * load JSON file to initialize DeciderManager
   * @param config
   */
  loadJson(config: InitilizationConfig) {
    initialize(this, config)
  }

  /**
   * Sets new decider with address
   * @param address
   * @param decier
   */
  public setDecider(address: Address, decier: Decider, shortname?: string) {
    this.deciders.set(address.raw, decier)
    if (shortname) {
      this.shortnames.set(shortname, address)
    }
  }
  /**
   * Gets decider with address
   * @param address
   */
  public getDecider(address: Address): Decider | null {
    const decider = this.deciders.get(address.raw)
    if (decider) {
      return decider
    } else {
      return null
    }
  }
  /**
   * Gets address of a decider with operator name
   * @param operator
   */
  public getDeciderAddress(shortname: string): Address {
    const address = this.shortnames.get(shortname)
    if (address) {
      return address
    } else {
      throw new Error("initialization isn't done")
    }
  }

  public get shortnameMap(): ReadonlyMap<string, Address> {
    return this.shortnames
  }

  public get compiledPredicateMap(): ReadonlyMap<string, CompiledPredicate> {
    return this.compiledPredicates
  }

  public setCompiledPredicate(
    predicateName: string,
    compiledPredicate: CompiledPredicate
  ) {
    this.compiledPredicates.set(predicateName, compiledPredicate)
  }

  /**
   * Decides property is true or false and returns decision structure.
   * @param property
   * @param substitutions Substitution rule of key value pair for free variables
   */
  public async decide(
    property: Property,
    substitutions: { [key: string]: Bytes } = {}
  ): Promise<Decision> {
    const decider = this.getDecider(property.deciderAddress)
    if (decider) {
      const inputs = bindVariables(property.inputs, substitutions)
      const decision = await decider.decide(this, inputs, substitutions)
      if (decision.outcome === false && decision.traceInfo === undefined) {
        // Set debug info for atomic predicates
        decision.traceInfo = TraceInfoCreator.create(
          decider.constructor.name,
          inputs
        )
      }
      return decision
    } else {
      throw new Error('Decider not found')
    }
  }
}

export const bindVariables = (
  inputs: Bytes[],
  substitutions: { [key: string]: Bytes }
): Bytes[] => {
  return inputs.map(input => {
    const key = FreeVariable.getVariableName(input)
    if (key && substitutions[key]) {
      return substitutions[key]
    }
    return input
  })
}
