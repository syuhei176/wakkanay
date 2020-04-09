import { Integer } from '../src'

describe('Integer', () => {
  describe('equals', () => {
    const x = Integer.from(1)
    const y = Integer.from(10)

    test('succeed to equals', () => {
      expect(x.equals(x)).toBeTruthy()
    })
    test('fail to equals', () => {
      expect(x.equals(y)).toBeFalsy()
    })
  })
})
