import { Property, FreeVariable } from '../../../src/ovm/types'
import { Address, Bytes, Integer } from '../../../src/types/Codables'
import {
  initializeDeciderManager,
  ForAllSuchThatDeciderAddress
} from '../helpers/initiateDeciderManager'
import {
  CompiledPredicate,
  constructInput,
  createSubstitutions
} from '../../../src/ovm/decompiler/CompiledPredicate'
import Coder from '../../../src/coder'
import { testSource } from './TestSource'
import { arrayify } from 'ethers/utils'
import { CompiledDecider } from '../../../src/ovm/decompiler'

describe('CompiledPredicate', () => {
  const TestPredicateAddress = Address.from(
    '0x0250035000301010002000900380005700060001'
  )

  const deciderManager = initializeDeciderManager()

  describe('decompileProperty', () => {
    const testOriginalProperty = {
      deciderAddress: ForAllSuchThatDeciderAddress,
      inputs: [
        Bytes.fromString('range,NUMBER,0x00-0x3130'),
        Bytes.fromString('b'),
        Coder.encode(
          new Property(TestPredicateAddress, [
            Bytes.fromString('TestFO'),
            FreeVariable.from('b'),
            Coder.encode(Integer.from(10))
          ]).toStruct()
        )
      ]
    }
    let compiledPredicate: CompiledPredicate
    beforeEach(() => {
      compiledPredicate = CompiledPredicate.fromSource(
        TestPredicateAddress,
        testSource
      )
      deciderManager.setDecider(
        TestPredicateAddress,
        new CompiledDecider(compiledPredicate),
        'Test'
      )
    })

    it('return Property', async () => {
      // Create an instance of compiled predicate "TestF(TestF, 10)".
      const property = compiledPredicate.decompileProperty(
        new Property(TestPredicateAddress, [
          Bytes.fromString('TestF'),
          Coder.encode(Integer.from(10))
        ]),
        deciderManager.shortnameMap
      )

      expect(property).toEqual(testOriginalProperty)
    })

    it('use default contract if label is not provided', async () => {
      // Create an instance of compiled predicate "Test(10)".
      const property = compiledPredicate.decompileProperty(
        new Property(TestPredicateAddress, [Coder.encode(Integer.from(10))]),
        deciderManager.shortnameMap
      )

      expect(property).toEqual(testOriginalProperty)
    })
  })

  describe('constructInput', () => {
    const childPropertyBytes = Coder.encode(
      new Property(TestPredicateAddress, [
        Bytes.fromString('0'),
        Bytes.fromString('1'),
        Bytes.fromString('2')
      ]).toStruct()
    )
    const propertyBytes = Coder.encode(
      new Property(TestPredicateAddress, [
        childPropertyBytes,
        Bytes.fromString('3')
      ]).toStruct()
    )
    it('return child input of property bytes', async () => {
      expect(constructInput(propertyBytes, [0, 0])).toEqual(
        Bytes.fromString('0')
      )
      expect(constructInput(propertyBytes, [1])).toEqual(Bytes.fromString('3'))
    })
  })

  describe('constructInput', () => {
    const childAddress = Address.from(
      '0x0250035000301010002000900380005700060002'
    )
    const childPropertyBytes = Coder.encode(
      new Property(childAddress, [
        Bytes.fromString('0'),
        Bytes.fromString('1'),
        Bytes.fromString('2')
      ]).toStruct()
    )
    const propertyBytes = Coder.encode(
      new Property(TestPredicateAddress, [
        childPropertyBytes,
        Bytes.fromString('3')
      ]).toStruct()
    )
    it('return anInput bytes as it is', async () => {
      expect(constructInput(propertyBytes, [])).toEqual(propertyBytes)
    })

    it('return child input of property bytes', async () => {
      expect(constructInput(propertyBytes, [1])).toEqual(Bytes.fromString('3'))
      expect(constructInput(propertyBytes, [0, 0])).toEqual(
        Bytes.fromString('0')
      )
      expect(constructInput(propertyBytes, [0, 2])).toEqual(
        Bytes.fromString('2')
      )
    })

    it('return child address of property bytes', async () => {
      expect(constructInput(propertyBytes, [-1])).toEqual(
        Bytes.fromHexString(TestPredicateAddress.data)
      )
      expect(constructInput(propertyBytes, [0, -1])).toEqual(
        Bytes.fromHexString(childAddress.data)
      )
    })

    it('throw exception', async () => {
      expect(() => {
        constructInput(Bytes.fromString('invalid'), [1])
      }).toThrowError('Unexpected token i in JSON at position 0')
    })
  })

  describe('createSubstitutions', () => {
    const a = Bytes.fromString('a')
    const b = Bytes.fromString('b')
    it('return key Bytes map object', async () => {
      expect(createSubstitutions(['a', 'b'], [a, b])).toEqual({
        a,
        b
      })
    })
    it('throw exception because input length are different', async () => {
      expect(() => {
        createSubstitutions(['a', 'b'], [a])
      }).toThrowError('The length of inputDefs and inputs must be same.')
    })
  })
})
