import {
  Address,
  Bytes,
  BigNumber,
  Range
} from '@cryptoeconomicslab/primitives'
import { Property } from '@cryptoeconomicslab/ovm'
import { decodeStructable } from '@cryptoeconomicslab/coder'
import { RangeRecord } from '@cryptoeconomicslab/db'
import JsonCoder, { Coder } from '@cryptoeconomicslab/coder'

import StateUpdateRecord from './StateUpdateRecord'

/**
 * StateUpdate wrapper class
 * StateUpdate is a property with inputs type
 * [tokenAddress: Address, range: Range, block_number: uint256, stateObject: Property]
 */
export default class StateUpdate {
  ['constructor']: typeof StateUpdate
  public static coder: Coder = JsonCoder

  constructor(
    public deciderAddress: Address,
    public depositContractAddress: Address,
    public range: Range,
    public blockNumber: BigNumber,
    public stateObject: Property
  ) {}

  public get amount(): bigint {
    return this.range.end.data - this.range.start.data
  }

  public get predicateAddress(): Address {
    return this.property.deciderAddress
  }

  public get property(): Property {
    const { coder } = this.constructor
    return new Property(this.deciderAddress, [
      coder.encode(this.depositContractAddress),
      coder.encode(this.range.toStruct()),
      coder.encode(this.blockNumber),
      coder.encode(this.stateObject.toStruct())
    ])
  }

  public update({
    depositContractAddress,
    range,
    blockNumber,
    stateObject
  }: {
    depositContractAddress?: Address
    range?: Range
    blockNumber?: BigNumber
    stateObject?: Property
  }) {
    if (depositContractAddress) {
      this.depositContractAddress = depositContractAddress
    }
    if (range) {
      this.range = range
    }
    if (blockNumber) {
      this.blockNumber = blockNumber
    }
    if (stateObject) {
      this.stateObject = stateObject
    }
  }

  public static fromProperty(property: Property) {
    return new this(
      property.deciderAddress,
      this.coder.decode(Address.default(), property.inputs[0]),
      decodeStructable(Range, this.coder, property.inputs[1]),
      this.coder.decode(BigNumber.default(), property.inputs[2]),
      decodeStructable(Property, this.coder, property.inputs[3])
    )
  }

  public static fromRangeRecord(r: RangeRecord): StateUpdate {
    return StateUpdate.fromRecord(
      decodeStructable(StateUpdateRecord, this.coder, r.value),
      new Range(r.start, r.end)
    )
  }

  public static fromRecord(
    record: StateUpdateRecord,
    range: Range
  ): StateUpdate {
    const inputs: Bytes[] = [
      record.depositContractAddress,
      range.toStruct(),
      record.blockNumber,
      record.stateObject.toStruct()
    ].map(this.coder.encode)

    const property = new Property(record.predicateAddress, inputs)

    return this.fromProperty(property)
  }

  public toRecord(): StateUpdateRecord {
    return new StateUpdateRecord(
      this.deciderAddress,
      this.depositContractAddress,
      this.blockNumber,
      this.stateObject
    )
  }
}

export function InjectCoderToStateUpdate(coder: Coder): typeof StateUpdate {
  return class InjectedStateUpdate extends StateUpdate {
    ['constructor']: typeof StateUpdate
    public static coder: Coder = coder
  }
}
