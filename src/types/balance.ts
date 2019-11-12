import BigNumber from 'bignumber.js'

export default class Balance {
  constructor(public value: BigNumber, public decimals: number, public symbol: string) {}

  public get displayValue(): string {
    return `${this.value.dividedBy(new BigNumber(10 ** this.decimals))} ${this.symbol}`
  }
}
