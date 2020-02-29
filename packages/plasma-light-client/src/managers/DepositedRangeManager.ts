import { RangeStore } from '@cryptoeconomicslab/db'
import { Address, Range, BigNumber } from '@cryptoeconomicslab/primitives'
import JSBI from 'jsbi'

/**
 * DepositedRangeManager
 * DepositedRangemanager keeps track of depositedRanges in depositContracts
 */
export default class DepositedRangeManager {
  constructor(private db: RangeStore) {}

  private async getBucket(addr: Address): Promise<RangeStore> {
    return await this.db.bucket(ovmContext.coder.encode(addr))
  }

  /**
   * extend existing range with newRange
   * @param depositContractAddress
   * @param newRange
   */
  public async extendRange(depositContractAddress: Address, newRange: Range) {
    const bucket = await this.getBucket(depositContractAddress)
    await bucket.put(
      newRange.start.data,
      newRange.end.data,
      ovmContext.coder.encode(newRange.end)
    )
  }

  /**
   * remove range from deposited range
   * @param depositContractAddress
   * @param range
   */
  public async removeRange(depositContractAddress: Address, range: Range) {
    const bucket = await this.getBucket(depositContractAddress)
    const prevRanges = await bucket.get(range.start.data, range.end.data)
    if (prevRanges.length !== 1) {
      throw new Error('invalid prev range')
    }

    const encompasingRange = prevRanges[0]
    const newRanges: Range[] = []

    if (!JSBI.equal(range.start.data, encompasingRange.start.data)) {
      newRanges.push(new Range(encompasingRange.start, range.start))
    }
    if (!JSBI.equal(range.end.data, encompasingRange.end.data)) {
      newRanges.push(new Range(range.end, encompasingRange.end))
    }

    await bucket.del(encompasingRange.start.data, encompasingRange.end.data)
    for (const range of newRanges) {
      await bucket.put(
        range.start.data,
        range.end.data,
        ovmContext.coder.encode(range.end)
      )
    }
  }

  /**
   * get depositedRangeId which covers given range
   * @param range
   */
  public async getDepositedRangeId(
    depositContractAddress: Address,
    range: Range
  ): Promise<BigNumber> {
    const bucket = await this.getBucket(depositContractAddress)
    const ranges = await bucket.get(range.start.data, range.end.data)
    if (ranges.length !== 1) throw new Error('Multiple ranges detected')
    return ranges[0].end
  }
}
