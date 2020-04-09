import { Address } from '../src'

describe('Address', () => {
  describe('equals', () => {
    const alice = Address.from('0x627306090abaB3A6e1400e9345bC60c78a8BEf57')
    const bob = Address.from('0xf17f52151EbEF6C7334FAD080c5704D77216b732')

    test('succeed to equals', () => {
      expect(alice.equals(alice)).toBeTruthy()
    })
    test('fail to equals', () => {
      expect(alice.equals(bob)).toBeFalsy()
    })
  })
})
