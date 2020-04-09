import { Integer, List } from '../src'

describe('List', () => {
  describe('equals', () => {
    const x = List.from(Integer, [Integer.from(1)])
    const y = List.from(Integer, [Integer.from(1), Integer.from(10)])

    test('succeed to equals', () => {
      expect(x.equals(x)).toBeTruthy()
    })
    test('fail to equals', () => {
      expect(x.equals(y)).toBeFalsy()
    })
  })
})
