import { FixedBytes, BigNumber } from '@cryptoeconomicslab/primitives'

export interface ICommitmentContract {
  submit(blockNumber: BigNumber, root: FixedBytes): Promise<void>

  getCurrentBlock(): Promise<BigNumber>

  getRoot(blockNumber: BigNumber): Promise<FixedBytes>

  subscribeBlockSubmitted(
    handler: (blockNumber: BigNumber, root: FixedBytes) => Promise<void>
  ): void

  startSubscribing(): void

  unsubscribeAll(): void
}
