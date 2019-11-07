import { Decision, Property } from '../types'
import { DeciderManager } from '../DeciderManager'

export interface Decider {
  decide(manager: DeciderManager, property: Property): Promise<Decision>
}
