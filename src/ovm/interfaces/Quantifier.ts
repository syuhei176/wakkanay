import { Bytes } from '../../types'
import { DeciderManager } from '../DeciderManager'

export interface QuantifiedResult {
  all_quantified: boolean
  quantified_result: Bytes[]
}
export interface Quantifier {
  getAllQuantified(
    manager: DeciderManager,
    inputs: Bytes[]
  ): Promise<QuantifiedResult>
}
