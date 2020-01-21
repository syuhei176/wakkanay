import { Bytes } from '@cryptoeconomicslab/primitives'
import { Decision } from '../types'
import { DeciderManagerInterface } from '../DeciderManager'

export interface Decider {
  decide(
    manager: DeciderManagerInterface,
    inputs: Bytes[],
    substitutions: { [key: string]: Bytes }
  ): Promise<Decision>
}
