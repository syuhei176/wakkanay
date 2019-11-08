import { Bytes } from '../../types/Codables'
import { DeciderManager } from '../DeciderManager'

export interface QuantifiedResult {
  allQuantified: boolean
  quantifiedResult: Bytes[]
}

export interface Quantifier {
  getAllQuantified(
    manager: DeciderManager,
    inputs: Bytes[]
  ): Promise<QuantifiedResult>
}
