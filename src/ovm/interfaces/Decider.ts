import { Bytes } from '../../types'
import { Decision } from '../types'
import { IDeciderManager } from './IDeciderManager'

export interface Decider {
  decide(manager: IDeciderManager, inputs: Bytes[]): Promise<Decision>
}
