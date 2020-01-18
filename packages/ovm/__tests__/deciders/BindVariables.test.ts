import { Bytes, Integer } from '@cryptoeconomicslab/primitives'
import Coder from '@cryptoeconomicslab/coder'
import { bindVariables, FreeVariable } from '../../src'

describe('FreeVariable', () => {
  test('return variable name', () => {
    const v = Bytes.fromString('__VARIABLE__n')
    expect(FreeVariable.getVariableName(v)).toBe('n')
  })

  test('return null if not well formed Bytes', () => {
    const v = Bytes.fromString('not well formed string')
    expect(FreeVariable.getVariableName(v)).toBeNull()
  })

  test('create free variable Bytes from variable name', () => {
    const v = FreeVariable.from('n')
    expect(v.intoString()).toBe('__VARIABLE__n')
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
