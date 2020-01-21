import { BigNumber } from '@cryptoeconomicslab/primitives'

export default class Balance {
  constructor(
    readonly value: BigNumber,
    readonly decimals: number,
    readonly symbol: string
  ) {}

  public get displayValue(): string {
    return `${this.value.data / BigInt(10 ** this.decimals)} ${this.symbol}`
  }
}
