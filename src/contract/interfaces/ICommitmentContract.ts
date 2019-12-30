import { Bytes, BigNumber } from '../../types/Codables'

export interface ICommitmentContract {
  submit(blockNumber: BigNumber, root: Bytes): Promise<void>

  getCurrentBlock(): Promise<BigNumber>

  subscribeBlockSubmitted(
    handler: (blockNumber: BigNumber, root: Bytes) => void
  ): void
}
