import { Bytes, Integer } from '../../../types/Codables'
import Coder from '../../../coder'
import { Quantifier, QuantifiedResult } from '../../interfaces/Quantifier'
import { Decision, Property } from '../../types'
import { DeciderManager } from '../../DeciderManager'

export const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (v, k) => k + start)

export class LessThanQuantifier implements Quantifier {
  public async getAllQuantified(
    manager: DeciderManager,
    inputs: Bytes[]
  ): Promise<QuantifiedResult> {
    const upperBound = Coder.decode(Integer.default(), inputs[0])

    const quantifiedResult = range(0, upperBound.data).map(i =>
      Coder.encode(Integer.from(i))
    )
    return { allQuantified: true, quantifiedResult }
  }
}
