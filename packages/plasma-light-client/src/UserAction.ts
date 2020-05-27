import {
  BigNumber,
  Bytes,
  Range,
  Struct,
  Address
} from '@cryptoeconomicslab/primitives'
import JSBI from 'jsbi'

export enum ActionType {
  Deposit = 'Deposit',
  Exit = 'Exit',
  Send = 'Send',
  Receive = 'Receive'
}

export function createDepositUserAction(
  tokenAddress: Address,
  range: Range,
  blockNumber: BigNumber
): UserAction {
  return new UserAction(
    ActionType.Deposit,
    tokenAddress,
    range,
    Address.default(),
    blockNumber
  )
}

export function createExitUserAction(
  tokenAddress: Address,
  range: Range,
  blockNumber: BigNumber
): UserAction {
  return new UserAction(
    ActionType.Exit,
    tokenAddress,
    range,
    Address.default(),
    blockNumber
  )
}

export function createSendUserAction(
  tokenAddress: Address,
  range: Range,
  to: Address,
  blockNumber: BigNumber
): UserAction {
  return new UserAction(ActionType.Send, tokenAddress, range, to, blockNumber)
}

export function createReceiveUserAction(
  tokenAddress: Address,
  range: Range,
  from: Address,
  blockNumber: BigNumber
): UserAction {
  return new UserAction(
    ActionType.Receive,
    tokenAddress,
    range,
    from,
    blockNumber
  )
}

/**
 * UserAction class to represent user action history
 */
export default class UserAction {
  constructor(
    readonly type: ActionType,
    readonly tokenContractAddress: Address,
    readonly range: Range,
    readonly counterParty: Address,
    readonly blockNumber: BigNumber
  ) {}

  public toStruct(): Struct {
    return new Struct([
      { key: 'type', value: Bytes.fromString(this.type) },
      { key: 'tokenContractAddress', value: this.tokenContractAddress },
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
      { key: 'type', value: Bytes.default() },
      { key: 'tokenContractAddress', value: Address.default() },
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
    const type = ActionType[(struct.data[0].value as Bytes).intoString()]
    const tokenAddress = struct.data[1].value as Address
    const range = struct.data[2].value as Struct
    const counterParty = struct.data[3].value as Address
    const blockNumber = struct.data[4].value as BigNumber
    return new UserAction(
      type,
      tokenAddress,
      Range.fromStruct(range),
      counterParty,
      blockNumber
    )
  }

  public get amount(): JSBI {
    return JSBI.subtract(this.range.end.data, this.range.start.data)
  }
}
