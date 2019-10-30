import { Address } from '../types'
import { Decider } from './interfaces/Decider'
import { Property, Decision } from './types'

/**
 * DeciderManager manages deciders and its address
 */
export class DeciderManager {
  private deciders: Map<Address, Decider>
  constructor() {
    this.deciders = new Map<Address, Decider>()
  }
  public setDecider(address: Address, decier: Decider) {
    this.deciders.set(address, decier)
  }
  public getDecider(address: Address): Decider | null {
    const decider = this.deciders.get(address)
    if (decider) {
      return decider
    } else {
      return null
    }
  }
  public async decide(property: Property): Promise<Decision> {
    const decider = this.getDecider(property.deciderAddress)
    if (decider) {
      return await decider.decide(this, property.inputs)
    } else {
      throw new Error('Decider not dound')
    }
  }
}
