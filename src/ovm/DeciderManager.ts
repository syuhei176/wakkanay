import { Address } from '../../src/types/Codables'
import { Decider } from './interfaces/Decider'
import { Property, Decision } from './types'

/**
 * DeciderManager manages deciders and its address
 */
export class DeciderManager {
  private deciders: Map<string, Decider>
  constructor() {
    this.deciders = new Map<string, Decider>()
  }
  /**
   * Sets new decider with address
   * @param address
   * @param decier
   */
  public setDecider(address: Address, decier: Decider) {
    this.deciders.set(address.raw, decier)
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
