import { Bytes, BigNumber } from '../../types/Codables'

export interface ICommitmentContract {
  submit(blockNumber: BigNumber, root: Bytes): Promise<void>

  subscribeBlockSubmitted(
    handler: (blockNumber: BigNumber, root: Bytes) => void
  ): void
}
