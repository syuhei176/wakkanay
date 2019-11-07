import { Bytes, Integer } from '../../../types/Codables'
import EthCoder from '../../../coder/EthCoder'
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
    const upperBound = EthCoder.decode(
      Integer.default(),
      inputs[0].toHexString()
    )

    const quantifiedResult = range(0, upperBound.data).map(i =>
      Bytes.fromHexString(EthCoder.encode(Integer.from(i)))
    )
    return { allQuantified: true, quantifiedResult }
  }
}
