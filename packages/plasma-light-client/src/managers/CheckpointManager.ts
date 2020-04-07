import { Checkpoint } from '@cryptoeconomicslab/plasma'
import { Address, Bytes, Range } from '@cryptoeconomicslab/primitives'
import { decodeStructable } from '@cryptoeconomicslab/coder'
import { KeyValueStore } from '@cryptoeconomicslab/db'
import { RangeDb } from '@cryptoeconomicslab/db'

export default class CheckpointManager {
  constructor(readonly kvs: KeyValueStore) {}

  private async getBucket(addr: Address): Promise<KeyValueStore> {
    return await (await this.kvs.bucket(Bytes.fromString('kvs'))).bucket(
      ovmContext.coder.encode(addr)
    )
  }

  private async getRangeDb(addr: Address): Promise<RangeDb> {
    const bucket = await (
      await this.kvs.bucket(Bytes.fromString('range'))
    ).bucket(ovmContext.coder.encode(addr))
    return new RangeDb(bucket)
  }

  public async insertCheckpoint(
    depositContractAddress: Address,
    checkpointId: Bytes,
    checkpoint: Checkpoint
  ) {
    const bucket = await this.getBucket(depositContractAddress)
    await bucket.put(
      checkpointId,
      ovmContext.coder.encode(checkpoint.toStruct())
    )
  }

  public async getCheckpoint(
    depositContractAddress: Address,
    checkpointId: Bytes
  ): Promise<Checkpoint | null> {
    const bucket = await this.getBucket(depositContractAddress)
    const res = await bucket.get(checkpointId)
    if (!res) return null

    return decodeStructable(Checkpoint, ovmContext.coder, res)
  }

  public async removeCheckpoint(
    depositContractAddress: Address,
    checkpointId: Bytes
  ) {
    const bucket = await this.getBucket(depositContractAddress)
    await bucket.del(checkpointId)
  }

  /**
   * @name insertCheckpointWithRange
   * @description insert checkpoint to find checkpoint with rangee
   * @param depositContractAddress deposit contract address of checkpoint
   * @param checkpoint a checkpoint object to insert
   */
  public async insertCheckpointWithRange(
    depositContractAddress: Address,
    checkpoint: Checkpoint
  ) {
    const rangeBucket = await this.getRangeDb(depositContractAddress)
    const range = decodeStructable(
      Range,
      ovmContext.coder,
      checkpoint.stateUpdate.inputs[1]
    )
    await rangeBucket.put(
      range.start.data,
      range.end.data,
      ovmContext.coder.encode(checkpoint.toStruct())
    )
  }

  /**
   * @name getCheckpointsWithRange
   * @description get checkpoint with range
   * @param depositContractAddress deposit contract address of checkpoint
   * @param range a range where checkpoint is stored
   */
  public async getCheckpointsWithRange(
    depositContractAddress: Address,
    range: Range
  ): Promise<Checkpoint[]> {
    const rangeBucket = await this.getRangeDb(depositContractAddress)
    const res = await rangeBucket.get(range.start.data, range.end.data)
    return res.map(r => decodeStructable(Checkpoint, ovmContext.coder, r.value))
  }
}
