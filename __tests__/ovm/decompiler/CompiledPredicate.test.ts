import { Property } from '../../../src/ovm/types'
import { Address, Bytes, Integer } from '../../../src/types/Codables'
import {
  initializeDeciderManager,
  ForAllSuchThatDeciderAddress,
  LessThanQuantifierAddress
} from '../helpers/initiateDeciderManager'
import {
  CompiledPredicate,
  constructInput
} from '../../../src/ovm/decompiler/CompiledPredicate'
import Coder from '../../../src/coder'
import { testSource } from './TestSource'

describe('CompiledPredicate', () => {
  const TestPredicateAddress = Address.from(
    '0x0250035000301010002000900380005700060001'
  )

  const deciderManager = initializeDeciderManager()

  it('return Property', async () => {
    const compiledPredicate = new CompiledPredicate(testSource, deciderManager)
    // Create an instance of compiled predicate "TestF(TestF, 10)".
    const property = compiledPredicate.instantiate(
      'TestF',
      TestPredicateAddress,
      [Bytes.fromString('TestF'), Coder.encode(Integer.from(10))]
    )

    expect(property).toEqual({
      deciderAddress: ForAllSuchThatDeciderAddress,
      inputs: [
        Coder.encode(
          new Property(LessThanQuantifierAddress, [
            Bytes.fromHexString('0x3130')
          ]).toStruct()
        ),
        Bytes.fromString('b'),
        Coder.encode(
          new Property(TestPredicateAddress, [
            Bytes.fromHexString('0x546573744641'),
            Bytes.fromHexString('0x5f5f5641524941424c455f5f62')
          ]).toStruct()
        )
      ]
    })
  })

  it('throw exception because the name is not found', async () => {
    const compiledPredicate = new CompiledPredicate(testSource, deciderManager)
    expect(() => {
      compiledPredicate.instantiate('NotFound', TestPredicateAddress, [
        Bytes.fromString('TestF'),
        Coder.encode(Integer.from(10))
      ])
    }).toThrowError('cannot find NotFound in contracts')
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
        expect(constructInput(Bytes.fromString('invalid'), [1])).toEqual(
          Bytes.fromString('3')
        )
      }).toThrowError('Unexpected token i in JSON at position 0')
    })
  })
})
