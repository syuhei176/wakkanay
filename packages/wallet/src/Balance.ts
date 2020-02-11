import { BigNumber } from '@cryptoeconomicslab/primitives'
import JSBI from 'jsbi'

export default class Balance {
  constructor(
    readonly value: BigNumber,
    readonly decimals: number,
    readonly symbol: string
  ) {}

  public get displayValue(): string {
    // FIXME: 10 ** this.decimals could overflow
    return `${JSBI.divide(this.value.data, JSBI.BigInt(10 ** this.decimals))} ${
      this.symbol
    }`
  }
}
