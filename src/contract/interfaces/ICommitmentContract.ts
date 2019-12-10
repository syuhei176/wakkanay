import { Bytes, Integer } from '../../types/Codables'

export interface ICommitmentContract {
  submit(blockNumber: number, root: Bytes): Promise<void>

  subscribeBlockSubmitted(
    handler: (blockNumber: Integer, root: Bytes) => void
  ): void
}
