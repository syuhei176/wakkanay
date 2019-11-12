import * as ethers from 'ethers'
import { IDepositContract } from '../interfaces/IDepositContract'
import { Property } from '../../ovm/types'
import { Integer } from '../../types/Codables'

export class DepositContract implements IDepositContract {
  connection: ethers.Contract
  gasLimit: number
  public static abi = [
    'function deposit(uint256 _amount, tuple(address, bytes[]) _initialState)',
    'function finalizeCheckpoint(tuple(address, bytes[]) _checkpoint)',
    'function finalizeExit(tuple(address, bytes[]) _exit, uint256 _depositedRangeId)'
  ]
  constructor(connection: ethers.Contract) {
    this.connection = connection
    this.gasLimit = 200000
  }
  async deposit(amount: Integer, initialState: Property): Promise<void> {
    return await this.connection.deposit(amount, initialState, {
      gasLimit: this.gasLimit
    })
  }
  async finalizeCheckpoint(checkpoint: Property): Promise<void> {
    return await this.connection.deposit(checkpoint, {
      gasLimit: this.gasLimit
    })
  }
  async finalizeExit(exit: Property, depositedRangeId: Integer): Promise<void> {
    return await this.connection.deposit(exit, depositedRangeId, {
      gasLimit: this.gasLimit
    })
  }
}
