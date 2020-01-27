import {
  Integer,
  Address,
  Range,
  BigNumber,
  Bytes,
  Struct,
  List
} from '@cryptoeconomicslab/primitives'

export const STATUS = {
  TRUE: Integer.from(1),
  FALSE: Integer.from(0)
}

export type valueof<T> = T[keyof T]

export default class TransactionReceipt {
  constructor(
    readonly status: typeof STATUS[keyof typeof STATUS],
    readonly blockNumber: BigNumber,
    readonly prevBlockNumbers: BigNumber[],
    readonly range: Range,
    readonly depositContractAddress: Address,
    readonly from: Address,
    readonly transactionHash: Bytes
  ) {}

  public static default(): TransactionReceipt {
    return new TransactionReceipt(
      STATUS.TRUE,
      BigNumber.default(),
      [],
      new Range(BigNumber.default(), BigNumber.default()),
      Address.default(),
      Address.default(),
      Bytes.default()
    )
  }

  public static getParamType(): Struct {
    return new Struct([
      { key: 'status', value: Integer.default() },
      { key: 'blockNumber', value: BigNumber.default() },
      {
        key: 'prevBlockNumbers',
        value: List.default(BigNumber, BigNumber.default())
      },
      { key: 'range', value: Range.getParamType() },
      { key: 'depositContractAddress', value: Address.default() },
      { key: 'from', value: Address.default() },
      { key: 'transactionHash', value: Bytes.default() }
    ])
  }

  public static fromStruct(struct: Struct): TransactionReceipt {
    return new TransactionReceipt(
      struct.data[0].value as Integer,
      struct.data[1].value as BigNumber,
      (struct.data[2].value as List<BigNumber>).data,
      Range.fromStruct(struct.data[3].value as Struct),
      struct.data[4].value as Address,
      struct.data[5].value as Address,
      struct.data[6].value as Bytes
    )
  }

  public toStruct(): Struct {
    return new Struct([
      { key: 'status', value: this.status },
      { key: 'blockNumber', value: this.blockNumber },
      {
        key: 'prevBlockNumbers',
        value: List.from(BigNumber, this.prevBlockNumbers)
      },
      { key: 'range', value: this.range.toStruct() },
      { key: 'depositContractAddress', value: this.depositContractAddress },
      { key: 'from', value: this.from },
      { key: 'transactionHash', value: this.transactionHash }
    ])
  }
}
