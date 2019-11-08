import { Address, Bytes } from '../../src/types/Codables'
import { Decider } from './interfaces/Decider'
import { Property, Decision, FreeVariable, LogicalConnective } from './types'

/**
 * DeciderManager manages deciders and its address
 */
export class DeciderManager {
  private deciders: Map<string, Decider>
  private operators: Map<LogicalConnective, Address>
  constructor() {
    this.deciders = new Map<string, Decider>()
    this.operators = new Map<LogicalConnective, Address>()
  }
  /**
   * Sets new decider with address
   * @param address
   * @param decier
   */
  public setDecider(
    address: Address,
    decier: Decider,
    operator?: LogicalConnective
  ) {
    this.deciders.set(address.raw, decier)
    if (operator) {
      this.operators.set(operator, address)
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
  public getDeciderAddress(operator: LogicalConnective): Address {
    const address = this.operators.get(operator)
    if (address) {
      return address
    } else {
      throw new Error("initialization isn't done")
    }
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
      return await decider.decide(
        this,
        bindVariables(property.inputs, substitutions)
      )
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
