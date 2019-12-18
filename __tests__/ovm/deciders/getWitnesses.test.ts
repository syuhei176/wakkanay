import { replaceHint } from '../../../src/ovm/deciders/getWitnesses'
import { Bytes } from '../../../src/types'

describe('replaceHint', () => {
  test('replace no vars', async () => {
    expect(replaceHint('a,b,c', {})).toEqual('a,b,c')
  })

  test('replace vars', async () => {
    expect(
      replaceHint('a,b.${g}.c,${d}', {
        d: Bytes.fromString('ddd'),
        g: Bytes.fromString('ggg')
      })
    ).toEqual('a,b.0x676767.c,0x646464')
  })
})
