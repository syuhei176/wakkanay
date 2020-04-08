import {
  BigNumber,
  Range,
  Struct,
  Integer,
  Address
} from '@cryptoeconomicslab/primitives'
import JSBI from 'jsbi'

export enum ActionType {
  Deposit,
  Exit,
  Send,
  Receive
}

export function createDepositUserAction(
  range: Range,
  blockNumber: BigNumber
): UserAction {
  return new UserAction(
    ActionType.Deposit,
    range,
    Address.default(),
    blockNumber
  )
}

export function createExitUserAction(
  range: Range,
  blockNumber: BigNumber
): UserAction {
  return new UserAction(ActionType.Exit, range, Address.default(), blockNumber)
}

export function createSendUserAction(
  range: Range,
  to: Address,
  blockNumber: BigNumber
): UserAction {
  return new UserAction(ActionType.Send, range, to, blockNumber)
}

export function createReceiveUserAction(
  range: Range,
  from: Address,
  blockNumber: BigNumber
): UserAction {
  return new UserAction(ActionType.Receive, range, from, blockNumber)
}

/**
 * UserAction class to represent user action history
 */
export default class UserAction {
  constructor(
    readonly type: ActionType,
    readonly range: Range,
    readonly counterParty: Address,
    readonly blockNumber: BigNumber
  ) {}

  public toStruct(): Struct {
    return new Struct([
      { key: 'type', value: Integer.from(this.type) },
      {
        key: 'range',
        value: this.range.toStruct()
      },
      {
        key: 'counterParty',
        value: this.counterParty
      },
      {
        key: 'blockNumber',
        value: this.blockNumber
      }
    ])
  }

  public static getParamTypes(): Struct {
    return new Struct([
      { key: 'type', value: Integer.default() },
      {
        key: 'range',
        value: Range.getParamType()
      },
      {
        key: 'counterParty',
        value: Address.default()
      },
      {
        key: 'blockNumber',
        value: BigNumber.default()
      }
    ])
  }

  public static fromStruct(struct: Struct): UserAction {
    const type = struct.data[0].value.raw
    const range = struct.data[1].value as Struct
    const counterParty = struct.data[2].value as Address
    const blockNumber = struct.data[3].value as BigNumber
    return new UserAction(
      type,
      Range.fromStruct(range),
      counterParty,
      blockNumber
    )
  }

  public get amount(): JSBI {
    return JSBI.subtract(this.range.end.data, this.range.start.data)
  }
}
