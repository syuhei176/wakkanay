import { Property, FreeVariable } from '../../../src/ovm/types'
import { Address, Bytes, Integer, BigNumber } from '../../../src/types/Codables'
import {
  initializeDeciderManager,
  ForAllSuchThatDeciderAddress,
  AndDeciderAddress,
  SampleDeciderAddress as BoolDeciderAddress,
  EqualDeciderAddress,
  IsContainedDeciderAddress
} from '../helpers/initiateDeciderManager'
import {
  CompiledPredicate,
  createAtomicPropositionCall,
  constructInput,
  createSubstitutions
} from '../../../src/ovm/decompiler/CompiledPredicate'
import Coder from '../../../src/coder'
import { testSource } from './TestSource'
import { ethers } from 'ethers'
import { Range } from '../../../src/types'
import { AtomicProposition } from 'ovm-compiler/dist/transpiler'

describe('CompiledPredicate', () => {
  const TestPredicateAddress = Address.from(
    '0x0250035000301010002000900380005700060001'
  )

  const deciderManager = initializeDeciderManager()
  const encodeProperty = (property: Property) =>
    Coder.encode(property.toStruct())
  const encodeBoolDecider = (input: Bytes) =>
    encodeProperty(new Property(BoolDeciderAddress, [input]))

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
    const compiledPredicate: CompiledPredicate = CompiledPredicate.fromSource(
      TestPredicateAddress,
      testSource
    )

    it('compiled predicate using quantifier', async () => {
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

    it('compiled predicate using logical connective', async () => {
      const compiledPredicateAnd = CompiledPredicate.fromSource(
        TestPredicateAddress,
        'def test(a, b) := Bool(a) and Bool(b)'
      )
      const testOriginalProperty = {
        deciderAddress: AndDeciderAddress,
        inputs: [
          encodeBoolDecider(Coder.encode(Integer.from(301))),
          encodeBoolDecider(Coder.encode(Integer.from(302)))
        ]
      }
      const property = compiledPredicateAnd.decompileProperty(
        new Property(TestPredicateAddress, [
          Coder.encode(Integer.from(301)),
          Coder.encode(Integer.from(302))
        ]),
        deciderManager.shortnameMap
      )
      expect(property).toEqual(testOriginalProperty)
    })

    it('compiled predicate using input predicate call', async () => {
      const compiledPredicateAnd = CompiledPredicate.fromSource(
        TestPredicateAddress,
        'def test(a, b) := a() and b()'
      )
      const testOriginalProperty = {
        deciderAddress: AndDeciderAddress,
        inputs: [
          encodeBoolDecider(Coder.encode(Integer.from(301))),
          encodeBoolDecider(Coder.encode(Integer.from(302)))
        ]
      }
      const property = compiledPredicateAnd.decompileProperty(
        new Property(TestPredicateAddress, [
          encodeBoolDecider(Coder.encode(Integer.from(301))),
          encodeBoolDecider(Coder.encode(Integer.from(302)))
        ]),
        deciderManager.shortnameMap
      )
      expect(property).toEqual(testOriginalProperty)
    })

    it('compiled predicate using variable predicate call', async () => {
      const txAddress = Address.from(ethers.constants.AddressZero)
      const txAddressBytes = Bytes.fromHexString(txAddress.data)
      const token = Bytes.fromHexString(ethers.constants.AddressZero)
      const range = Coder.encode(
        new Range(BigNumber.from(0), BigNumber.from(100)).toStruct()
      )
      const block = Coder.encode(Integer.from(50))
      const so = Bytes.fromHexString('0x00')
      const tx = new Property(txAddress, [token, range, block, so])
      const compiledPredicateAnd = CompiledPredicate.fromSource(
        TestPredicateAddress,
        'def test(token, range, block) := with Tx(token, range, block) as tx { tx() }'
      )
      const encodeEqDecider = (a: Bytes, b: Bytes) =>
        encodeProperty(new Property(EqualDeciderAddress, [a, b]))
      const encodeIsContainedDecider = (a: Bytes, b: Bytes) =>
        encodeProperty(new Property(IsContainedDeciderAddress, [a, b]))
      const testOriginalProperty = {
        deciderAddress: AndDeciderAddress,
        inputs: [
          encodeEqDecider(txAddressBytes, txAddressBytes),
          encodeEqDecider(token, token),
          encodeIsContainedDecider(range, range),
          encodeEqDecider(block, block),
          encodeProperty(tx)
        ]
      }
      const property = compiledPredicateAnd.decompileProperty(
        new Property(TestPredicateAddress, [
          Bytes.fromString('TestTA'),
          encodeProperty(tx),
          token,
          range,
          block
        ]),
        deciderManager.shortnameMap,
        { TransactionAddress: txAddressBytes }
      )
      expect(property).toEqual(testOriginalProperty)
    })
  })

  describe('createAtomicPropositionCall', () => {
    const compiledPredicateAnd = CompiledPredicate.fromSource(
      TestPredicateAddress,
      'def test(a) := Bool(a) and Bool($b) and Bool(self.address)'
    )
    const definition = compiledPredicateAnd.compiled.contracts[0]
    const compiledProperty = new Property(TestPredicateAddress, [
      Bytes.fromString('TestA'),
      Coder.encode(Integer.from(301))
    ])

    it('create atomic proposition call with normal input', async () => {
      expect(
        createAtomicPropositionCall(
          definition.inputs[0] as AtomicProposition,
          definition,
          {
            compiledProperty,
            predicateTable: deciderManager.shortnameMap,
            constantTable: {}
          }
        )
      ).toEqual(encodeBoolDecider(Coder.encode(Integer.from(301))))
    })

    it('throw exception because not enough inputs', async () => {
      const invalidCompiledProperty = new Property(TestPredicateAddress, [])
      expect(() => {
        createAtomicPropositionCall(
          definition.inputs[0] as AtomicProposition,
          definition,
          {
            compiledProperty: invalidCompiledProperty,
            predicateTable: deciderManager.shortnameMap,
            constantTable: {}
          }
        )
      }).toThrowError(
        new Error(`Property(${TestPredicateAddress}) don't have enough inputs.`)
      )
    })

    it('create atomic proposition call with constant input', async () => {
      expect(
        createAtomicPropositionCall(
          definition.inputs[1] as AtomicProposition,
          definition,
          {
            compiledProperty,
            predicateTable: deciderManager.shortnameMap,
            constantTable: { b: Coder.encode(Integer.from(302)) }
          }
        )
      ).toEqual(encodeBoolDecider(Coder.encode(Integer.from(302))))
    })

    it('create atomic proposition call with self input', async () => {
      expect(
        createAtomicPropositionCall(
          definition.inputs[2] as AtomicProposition,
          definition,
          {
            compiledProperty,
            predicateTable: deciderManager.shortnameMap,
            constantTable: {}
          }
        )
      ).toEqual(
        encodeBoolDecider(Bytes.fromHexString(TestPredicateAddress.data))
      )
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
