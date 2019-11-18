import BigNumber from 'bignumber.js'

export default class Balance {
  private _value: BigNumber
  private _decimals: number
  private _symbol: string
  constructor(value: BigNumber, decimals: number, symbol: string) {
    this._value = value
    this._decimals = decimals
    this._symbol = symbol
  }

  public get balance(): Balance {
    return this
  }

  public get value(): BigNumber {
    return this._value
  }

  public get decimals(): number {
    return this._decimals
  }

  public get symbol(): string {
    return this._symbol
  }

  public get displayValue(): string {
    return `${this.value.dividedBy(new BigNumber(10 ** this.decimals))} ${
      this.symbol
    }`
  }
}
