import BigNumber from 'bignumber.js'

export default class Balance {
  constructor(
    readonly value: BigNumber,
    readonly decimals: number,
    readonly symbol: string
  ) {}

  public get displayValue(): string {
    return `${this.value.dividedBy(new BigNumber(10 ** this.decimals))} ${
      this.symbol
    }`
  }
}
