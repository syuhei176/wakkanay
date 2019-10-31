import { Bytes } from '../../types'
import { Decision } from '../types'
import { DeciderManager } from '../DeciderManager'

export interface Decider {
  decide(manager: DeciderManager, inputs: Bytes[]): Promise<Decision>
}
