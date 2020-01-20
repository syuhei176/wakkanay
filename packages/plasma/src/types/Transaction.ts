import {
  Address,
  Range,
  BigNumber,
  Bytes,
  Struct
} from '@cryptoeconomicslab/primitives'
import { Property } from '@cryptoeconomicslab/ovm'
import { Keccak256 } from '@cryptoeconomicslab/hash'

export default class Transaction {
  constructor(
    public depositContractAddress: Address,
    public range: Range,
    public stateObject: Property,
    public from: Address,
    public signature: Bytes = Bytes.default()
  ) {}

  /**
   * return empty instance of StateUpdate
   */
  public static default(): Transaction {
    return new Transaction(
      Address.default(),
      new Range(BigNumber.default(), BigNumber.default()),
      new Property(Address.default(), []),
      Address.default(),
      Bytes.default()
    )
  }

  public static getParamTypes(): Struct {
    return new Struct([
      { key: 'depositContractAddress', value: Address.default() },
      { key: 'range', value: Range.getParamType() },
      { key: 'stateObject', value: Property.getParamType() },
      { key: 'from', value: Address.default() },
      { key: 'signature', value: Bytes.default() }
    ])
  }

  public static fromStruct(struct: Struct): Transaction {
    const depositContractAddress = struct.data[0].value as Address
    const range = struct.data[1].value as Struct
    const stateObject = struct.data[2].value as Struct
    const from = struct.data[3].value as Address
    const signature = struct.data[4].value as Bytes

    return new Transaction(
      depositContractAddress as Address,
      Range.fromStruct(range as Struct),
      Property.fromStruct(stateObject as Struct),
      from as Address,
      signature as Bytes
    )
  }

  public toStruct(): Struct {
    return new Struct([
      { key: 'depositContractAddress', value: this.depositContractAddress },
      { key: 'range', value: this.range.toStruct() },
      { key: 'stateObject', value: this.stateObject.toStruct() },
      { key: 'from', value: this.from },
      { key: 'signature', value: this.signature }
    ])
  }

  public get body(): Struct {
    return new Struct([
      { key: 'depositContractAddress', value: this.depositContractAddress },
      { key: 'range', value: this.range.toStruct() },
      { key: 'stateObject', value: this.stateObject.toStruct() },
      { key: 'from', value: this.from }
    ])
  }

  public getHash(): Bytes {
    return Keccak256.hash(context.coder.encode(this.body))
  }
}
