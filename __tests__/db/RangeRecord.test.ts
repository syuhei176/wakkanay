import { RangeRecord } from '../../src/db/RangeStore'
import { Bytes } from '../../src/types/Codables'

describe('RangeRecord', () => {
  const testValue = Bytes.fromString('value')
  describe('intersect', () => {
    // rangeRecord.start < testRange.start
    it('does not intersect for [0-50) and [100-200)', () => {
      const rangeRecord = new RangeRecord(0, 50, testValue)
      expect(rangeRecord.intersect(100, 200)).toBeFalsy()
    })
    it('does not intersect for [0-100) and [100-200)', () => {
      const rangeRecord = new RangeRecord(0, 100, testValue)
      expect(rangeRecord.intersect(100, 200)).toBeFalsy()
    })
    it('intersects for [0-150) and [100-200)', () => {
      const rangeRecord = new RangeRecord(0, 150, testValue)
      expect(rangeRecord.intersect(100, 200)).toBeTruthy()
    })
    it('intersects for [0-200) and [100-200)', () => {
      const rangeRecord = new RangeRecord(0, 200, testValue)
      expect(rangeRecord.intersect(100, 200)).toBeTruthy()
    })
    it('intersect returns true when testRange[100, 200) is subrange of rangeRecord[0, 300)', () => {
      const rangeRecord = new RangeRecord(0, 300, testValue)
      expect(rangeRecord.intersect(100, 200)).toBeTruthy()
    })
    // rangeRecord.start == testRange.start
    it('intersect returns true when rangeRecord and testRange are same ranges', () => {
      const rangeRecord = new RangeRecord(0, 100, testValue)
      expect(rangeRecord.intersect(0, 100)).toBeTruthy()
    })
    // rangeRecord.start > testRange.start
    it('does not intersect for [100-200) and [0-50)', () => {
      const rangeRecord = new RangeRecord(100, 200, testValue)
      expect(rangeRecord.intersect(0, 50)).toBeFalsy()
    })
    it('does not intersect for [100-200) and [0-100)', () => {
      const rangeRecord = new RangeRecord(100, 200, testValue)
      expect(rangeRecord.intersect(0, 100)).toBeFalsy()
    })
    it('intersects for rangeRecord[100, 200) and testRange[0, 150)', () => {
      const rangeRecord = new RangeRecord(100, 200, testValue)
      expect(rangeRecord.intersect(0, 150)).toBeTruthy()
    })
    it('intersects when rangeRecord[100, 200) is subrange of testRange[0, 300)', () => {
      const rangeRecord = new RangeRecord(100, 200, testValue)
      expect(rangeRecord.intersect(0, 300)).toBeTruthy()
    })
  })
})
