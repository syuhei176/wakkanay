import { Block } from './block'
import { ICommitmentContract } from '../../../contract'
import { Transaction } from '../../../models/Transaction'

export class BlockManager {
  private commitmentContract: ICommitmentContract
  constructor(commitmentContract: ICommitmentContract) {
    this.commitmentContract = commitmentContract
  }
  public async enqueueTx(transaction: Transaction): Promise<void> {}
  public async enqueueStateUpdate(): Promise<void> {}
  public async submitNextBlock(): Promise<void> {
    this.commitmentContract.submit(1, '0x00')
  }
  public async getBlock(blockNumber: number): Promise<Block> {
    return new Block()
  }
}
