import { KeyValueStore } from '@cryptoeconomicslab/db'
import { FixedBytes, Bytes, BigNumber } from '@cryptoeconomicslab/primitives'

const LATEST_SYNCED_BLOCK = Bytes.fromString('latest_synced_block')

export default class SyncManager {
  constructor(readonly db: KeyValueStore) {}

  public async getLatestSyncedBlockNumber(): Promise<BigNumber> {
    const d = await this.db.get(LATEST_SYNCED_BLOCK)

    if (!d) return BigNumber.from(-1)
    return ovmContext.coder.decode(BigNumber.default(), d)
  }

  public async getRoot(blockNumber: BigNumber): Promise<FixedBytes | null> {
    const data = await this.db.get(ovmContext.coder.encode(blockNumber))
    if (!data) return null
    return FixedBytes.from(32, data.data)
  }

  /**
   * update synced block number and save root hash of the block
   * @param blockNumber block number to be set as LATEST_SYNCED_BLOCK
   * @param root root hash of the newly synced block
   */
  public async updateSyncedBlockNumber(
    blockNumber: BigNumber,
    root: FixedBytes
  ): Promise<void> {
    await this.db.put(LATEST_SYNCED_BLOCK, ovmContext.coder.encode(blockNumber))
    await this.db.put(
      ovmContext.coder.encode(blockNumber),
      Bytes.from(root.data)
    )
  }
}
