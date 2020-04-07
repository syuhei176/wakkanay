import { Range, Struct, Integer, Address } from '@cryptoeconomicslab/primitives'
import JSBI from 'jsbi'

export enum ActionType {
  Deposit,
  Exit,
  Send,
  Receive
}

export function createDepositUserAction(range: Range): UserAction {
  return new UserAction(ActionType.Deposit, range, Address.default())
}

export function createExitUserAction(range: Range): UserAction {
  return new UserAction(ActionType.Exit, range, Address.default())
}

export function createSendUserAction(range: Range, to: Address): UserAction {
  return new UserAction(ActionType.Send, range, to)
}

export function createReceiveUserAction(
  range: Range,
  from: Address
): UserAction {
  return new UserAction(ActionType.Receive, range, from)
}

/**
 * UserAction class to represent user action history
 */
export default class UserAction {
  constructor(
    readonly type: ActionType,
    readonly range: Range,
    readonly counterParty: Address
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
      }
    ])
  }

  public static fromStruct(struct: Struct): UserAction {
    const type = struct.data[0].value.raw
    const range = struct.data[1].value as Struct
    const counterParty = struct.data[2].value as Address
    return new UserAction(type, Range.fromStruct(range), counterParty)
  }

  public get amount(): JSBI {
    return JSBI.subtract(this.range.end.data, this.range.start.data)
  }
}
