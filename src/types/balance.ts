import BigNumber from 'bignumber.js'

export default class Balance {
  constructor(value: BigNumber, decimals: number, symbol: string) {}

  public get balance(): Balance {
    return this
  }

  public get value(): BigNumber {
    return this.value
  }

  public get decimals(): number {
    return this.decimals
  }

  public get symbol(): string {
    return this.symbol
  }

  public get displayValue(): string {
    return `${this.value.dividedBy(new BigNumber(10 ** this.decimals))} ${this.symbol}`
  }
}
