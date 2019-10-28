import {
  Integer,
  Address,
  Struct,
  Bytes,
  List,
  Tuple
} from '../src/types/Encodables'

describe('Encodables', () => {
  test('IEncodable.toString()', () => {
    const i = Integer.from(1)

    expect(i.toString()).toBe('Integer(1)')
  })
})
