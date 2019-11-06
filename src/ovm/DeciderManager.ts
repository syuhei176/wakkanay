import { Address } from '../types'
import { Decider } from './interfaces/Decider'
import { Property, Decision } from './types'
import { Quantifier } from './interfaces/Quantifier'

/**
 * DeciderManager manages deciders and its address
 */
export class DeciderManager {
  private deciders: Map<Address, Decider>
  private operators: Map<String, Address>
  private quantifiers: Map<Address, Quantifier>
  constructor() {
    this.deciders = new Map<Address, Decider>()
    this.operators = new Map<String, Address>()
    this.quantifiers = new Map<Address, Quantifier>()
  }
  public setDecider(address: Address, decier: Decider, operator?: string) {
    this.deciders.set(address, decier)
    if (operator) {
      this.operators.set(operator, address)
    }
  }
  public getDecider(address: Address): Decider | null {
    const decider = this.deciders.get(address)
    if (decider) {
      return decider
    } else {
      return null
    }
  }
  public getDeciderAddress(operator: string): Address {
    const address = this.operators.get(operator)
    if (address) {
      return address
    } else {
      throw new Error("initialization isn't done")
    }
  }
  public setQuantifier(address: Address, quantifier: Quantifier) {
    this.quantifiers.set(address, quantifier)
  }
  public getQuantifier(address: Address): Quantifier | null {
    const quantifier = this.quantifiers.get(address)
    if (quantifier) {
      return quantifier
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
