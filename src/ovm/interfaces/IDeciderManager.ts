import { Decider } from './Decider'
import { Address } from '../../types'
import { Property, Decision } from '../types'

export interface IDeciderManager {
  setDecider(address: Address, decier: Decider): void
  getDecider(address: Address): Decider | null
  decide(property: Property): Promise<Decision>
}
