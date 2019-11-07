import { Address } from '../../src/types/Codables'
import { Decider } from './interfaces/Decider'
import { Property, Decision } from './types'

/**
 * DeciderManager manages deciders and its address
 */
export class DeciderManager {
  private deciders: Map<string, Decider>
  private operators: Map<String, Address>
  constructor() {
    this.deciders = new Map<string, Decider>()
    this.operators = new Map<String, Address>()
  }
  /**
   * Sets new decider with address
   * @param address
   * @param decier
   */
  public setDecider(address: Address, decier: Decider, operator?: string) {
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
  public getDeciderAddress(operator: string): Address {
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
   */
  public async decide(property: Property): Promise<Decision> {
    const decider = this.getDecider(property.deciderAddress)
    if (decider) {
      return await decider.decide(this, property.inputs)
    } else {
      throw new Error('Decider not found')
    }
  }
}
