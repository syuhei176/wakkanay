import {
  StateUpdate,
  Block,
  StateUpdateRecord
} from '@cryptoeconomicslab/plasma'
import {
  Address,
  Bytes,
  BigNumber,
  Range
} from '@cryptoeconomicslab/primitives'
import {
  RangeDb,
  RangeStore,
  KeyValueStore,
  RangeRecord
} from '@cryptoeconomicslab/db'
import { decodeStructable } from '@cryptoeconomicslab/coder'
import JSBI from 'jsbi'

const STATE_UPDATE_BUCKET = Bytes.fromString('queued_state_updates')
const BLOCK_BUCKET = Bytes.fromString('block')

export default class BlockManager {
  private blockNumber: BigNumber
  private tokenList: Address[]
  private ready = false

  constructor(private kvs: KeyValueStore) {
    this.blockNumber = BigNumber.from(0)
    this.tokenList = []
  }

  private async tokenBucket(addr: Address): Promise<RangeStore> {
    const rangeDb = new RangeDb(await this.kvs.bucket(STATE_UPDATE_BUCKET))
    return await rangeDb.bucket(Bytes.fromString(addr.data))
  }

  /**
   * remove all state updates of given token address
   * @param addr token address which state updates belongs to, will be deleted
   */
  private async clearTokenBucket(addr: Address) {
    const db = await this.tokenBucket(addr)
    await db.del(JSBI.BigInt(0), JSBI.BigInt(10000)) // TODO: change later
  }

  /**
   * returns current block number
   */
  public get currentBlockNumber() {
    return this.blockNumber
  }

  /**
   * returns next block number
   */
  public get nextBlockNumber() {
    return BigNumber.from(JSBI.add(this.blockNumber.data, JSBI.BigInt(1)))
  }

  /**
   * represents if block manager is ready to submit next block
   * which is false right after a block is submitted.
   */
  public get isReady(): boolean {
    return this.ready
  }

  /**
   * append state update for next block
   * @param su state update to be appended for next block submission
   */
  public async enqueuePendingStateUpdate(su: StateUpdate) {
    console.log('enqueue state update', su)
    const { start, end } = su.range
    const bucket = await this.tokenBucket(su.depositContractAddress)
    await bucket.put(
      start.data,
      end.data,
      ovmContext.coder.encode(su.toRecord().toStruct())
    )
    this.ready = true
  }

  /**
   * create next block with pending state updates in block
   * store new block and clear all pending updates in block db.
   */
  public async generateNextBlock(): Promise<Block> {
    if (!this.isReady)
      throw new Error('No state updates to generate next block')
    const stateUpdatesMap = new Map()
    await Promise.all(
      this.tokenList.map(async token => {
        const db = await this.tokenBucket(token)
        const stateUpdateRanges: RangeRecord[] = []
        const cursor = db.iter(JSBI.BigInt(0))
        let su = await cursor.next()
        while (su !== null) {
          stateUpdateRanges.push(su)
          su = await cursor.next()
        }

        const stateUpdates = stateUpdateRanges.map(r =>
          StateUpdate.fromRecord(
            decodeStructable(StateUpdateRecord, ovmContext.coder, r.value),
            new Range(r.start, r.end)
          )
        )
        stateUpdatesMap.set(token.data, stateUpdates)

        await this.clearTokenBucket(token)
      })
    )

    const block = new Block(
      BigNumber.from(JSBI.add(this.blockNumber.data, JSBI.BigInt(1))),
      stateUpdatesMap
    )
    this.putBlock(block)

    // increment blockNumber
    this.blockNumber = BigNumber.from(
      JSBI.add(this.blockNumber.data, JSBI.BigInt(1))
    )

    // set next block submission is not ready
    this.ready = false
    return block
  }

  /**
   * get block from database
   * @param blockNumber block number to fetch
   * @returns {Promise<Block | null>}
   */
  public async getBlock(blockNumber: BigNumber): Promise<Block | null> {
    const blockBucket = await this.kvs.bucket(BLOCK_BUCKET)
    const res = await blockBucket.get(ovmContext.coder.encode(blockNumber))
    if (!res) return null
    return decodeStructable(Block, ovmContext.coder, res)
  }

  /**
   * save block to database
   * @param block block to save
   */
  public async putBlock(block: Block): Promise<void> {
    const blockBucket = await this.kvs.bucket(BLOCK_BUCKET)
    await blockBucket.put(
      ovmContext.coder.encode(BigNumber.from(block.blockNumber)),
      ovmContext.coder.encode(block.toStruct())
    )
  }

  /**
   * register new token
   * @param tokenAddress token address to be registered
   */
  public registerToken(tokenAddress: Address) {
    this.tokenList.push(tokenAddress)
  }
}
