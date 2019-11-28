import { RangeRecord } from '../../src/db/RangeStore'
import { Bytes } from '../../src/types/Codables'

describe('RangeRecord', () => {
  const testValue = Bytes.fromString('value')
  describe('intersect', () => {
    // rangeRecord.start < testRange.start
    it('does not intersect for [0-50) and [100-200)', () => {
      const rangeRecord = new RangeRecord(0, 50, testValue)
      expect(rangeRecord.intersect(100n, 200n)).toBeFalsy()
    })
    it('does not intersect for [0-100) and [100-200)', () => {
      const rangeRecord = new RangeRecord(0, 100, testValue)
      expect(rangeRecord.intersect(100n, 200n)).toBeFalsy()
    })
    it('intersects for [0-150) and [100-200)', () => {
      const rangeRecord = new RangeRecord(0, 150, testValue)
      expect(rangeRecord.intersect(100n, 200n)).toBeTruthy()
    })
    it('intersects for [0-200) and [100-200)', () => {
      const rangeRecord = new RangeRecord(0, 200, testValue)
      expect(rangeRecord.intersect(100n, 200n)).toBeTruthy()
    })
    it('intersect returns true when testRange[100, 200) is subrange of rangeRecord[0, 300)', () => {
      const rangeRecord = new RangeRecord(0, 300, testValue)
      expect(rangeRecord.intersect(100n, 200n)).toBeTruthy()
    })
    // rangeRecord.start == testRange.start
    it('intersect returns true when rangeRecord and testRange are same ranges', () => {
      const rangeRecord = new RangeRecord(0, 100, testValue)
      expect(rangeRecord.intersect(0n, 100n)).toBeTruthy()
    })
    // rangeRecord.start > testRange.start
    it('does not intersect for [100-200) and [0-50)', () => {
      const rangeRecord = new RangeRecord(100, 200, testValue)
      expect(rangeRecord.intersect(0n, 50n)).toBeFalsy()
    })
    it('does not intersect for [100-200) and [0-100)', () => {
      const rangeRecord = new RangeRecord(100, 200, testValue)
      expect(rangeRecord.intersect(0n, 100n)).toBeFalsy()
    })
    it('intersects for rangeRecord[100, 200) and testRange[0, 150)', () => {
      const rangeRecord = new RangeRecord(100, 200, testValue)
      expect(rangeRecord.intersect(0n, 150n)).toBeTruthy()
    })
    it('intersects when rangeRecord[100, 200) is subrange of testRange[0, 300)', () => {
      const rangeRecord = new RangeRecord(100, 200, testValue)
      expect(rangeRecord.intersect(0n, 300n)).toBeTruthy()
    })
    // other exceptions
    it('throw error when start or end is negative value', () => {
      const rangeRecord = new RangeRecord(100, 200, testValue)
      expect(() => {
        rangeRecord.intersect(-100n, 100n)
      }).toThrow('start must not be negative value.')
      expect(() => {
        rangeRecord.intersect(-200n, -100n)
      }).toThrow('start must not be negative value.')
    })
    it('throw error when end is greater than start', () => {
      const rangeRecord = new RangeRecord(100, 200, testValue)
      expect(() => {
        rangeRecord.intersect(500n, 200n)
      }).toThrow('end must be greater than start.')
      expect(() => {
        rangeRecord.intersect(-200n, -500n)
      }).toThrow('end must be greater than start.')
    })
  })
})
