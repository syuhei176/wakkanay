import { Bytes, Integer } from '@cryptoeconomicslab/primitives'
import Coder from '@cryptoeconomicslab/coder'
import { bindVariables, FreeVariable } from '../../src'
import { setupContext } from '@cryptoeconomicslab/context'
setupContext({ coder: Coder })

describe('FreeVariable', () => {
  test('return variable name', () => {
    const v = Bytes.fromString('Vn')
    expect(FreeVariable.getVariableName(v)).toBe('n')
  })

  test('return null if not well formed Bytes', () => {
    const v = Bytes.fromString('not well formed string')
    expect(FreeVariable.getVariableName(v)).toBeNull()
  })

  test('return null with bytes which has "V(0x56)" but it is not prefix', () => {
    const v = Bytes.fromHexString('0x0000563c')
    expect(FreeVariable.getVariableName(v)).toBeNull()
  })

  test('create free variable Bytes from variable name', () => {
    const v = FreeVariable.from('n')
    expect(v.intoString()).toBe('Vn')
  })
})

describe('Bind variables', () => {
  test('bind variables', () => {
    const inputs = [Bytes.fromString('hello'), FreeVariable.from('n')]

    const substitutions = {
      n: Coder.encode(Integer.from(100))
    }

    const boundInputs = bindVariables(inputs, substitutions)
    expect(boundInputs).toStrictEqual([
      Bytes.fromString('hello'),
      Coder.encode(Integer.from(100))
    ])
  })

  test('bind variables only in substitutions', () => {
    const inputs = [
      Bytes.fromString('hello'),
      FreeVariable.from('n'),
      FreeVariable.from('m')
    ]

    const substitutions = {
      n: Coder.encode(Integer.from(100))
    }

    const boundInputs = bindVariables(inputs, substitutions)
    expect(boundInputs).toStrictEqual([
      Bytes.fromString('hello'),
      Coder.encode(Integer.from(100)),
      FreeVariable.from('m')
    ])
  })
})
