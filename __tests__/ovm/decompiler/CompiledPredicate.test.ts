import { Property } from '../../../src/ovm/types'
import { Address, Bytes, Integer } from '../../../src/types/Codables'
import {
  initializeDeciderManager,
  ForAllSuchThatDeciderAddress,
  LessThanQuantifierAddress
} from '../helpers/initiateDeciderManager'
import {
  CompiledPredicate,
  createSubstitutions
} from '../../../src/ovm/decompiler/CompiledPredicate'
import Coder from '../../../src/coder'
import { testSource } from './TestSource'
import { arrayify } from 'ethers/utils'

describe('CompiledPredicate', () => {
  const TestPredicateAddress = Address.from(
    '0x0250035000301010002000900380005700060001'
  )

  const deciderManager = initializeDeciderManager()

  it('return Property', async () => {
    const compiledPredicate = new CompiledPredicate(testSource)
    // Create an instance of compiled predicate "TestF(TestF, 10)".
    const property = compiledPredicate.decompileProperty(
      new Property(TestPredicateAddress, [
        Bytes.fromString('TestF'),
        Coder.encode(Integer.from(10))
      ]),
      deciderManager.shortnameMap
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
    const compiledPredicate = new CompiledPredicate(testSource)
    expect(() => {
      compiledPredicate.decompileProperty(
        new Property(TestPredicateAddress, [
          Bytes.fromString('NotFound'),
          Coder.encode(Integer.from(10))
        ]),
        deciderManager.shortnameMap
      )
    }).toThrowError('cannot find NotFound in contracts')
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
