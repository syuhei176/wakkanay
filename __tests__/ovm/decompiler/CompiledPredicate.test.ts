import { Property } from '../../../src/ovm/types'
import { Address, Bytes, Integer } from '../../../src/types/Codables'
import DefaultCoder from '../../../src/coder'
import {
  initializeDeciderManager,
  ForAllSuchThatDeciderAddress,
  LessThanDeciderAddress
} from '../helpers/initiateDeciderManager'
import { CompiledPredicate } from '../../../src/ovm/decompiler/CompiledPredicate'
import { transpiler } from 'ovm-compiler'
import * as ethers from 'ethers'
import Coder from '../../../src/coder'

describe('CompiledPredicate', () => {
  const TestPredicateAddress = Address.from(
    '0x0250035000301010002000900380005700060001'
  )
  const compiledPredicateSource: transpiler.CompiledPredicate = {
    type: 'CompiledPredicate',
    name: 'Test',
    inputDefs: ['a'],
    contracts: [
      {
        type: 'IntermediateCompiledPredicate',
        isCompiled: true,
        originalPredicateName: 'Test',
        definition: {
          type: 'IntermediateCompiledPredicateDef',
          name: 'TestFA',
          predicate: 'And',
          inputDefs: ['TestFA', 'b'],
          inputs: [
            {
              type: 'AtomicProposition',
              predicate: { type: 'AtomicPredicate', source: 'Bool' },
              inputs: [{ type: 'NormalInput', inputIndex: 1, children: [] }]
            },
            {
              type: 'AtomicProposition',
              predicate: { type: 'AtomicPredicate', source: 'Bool' },
              inputs: [{ type: 'NormalInput', inputIndex: 1, children: [] }]
            }
          ]
        }
      },
      {
        type: 'IntermediateCompiledPredicate',
        isCompiled: true,
        originalPredicateName: 'Test',
        definition: {
          type: 'IntermediateCompiledPredicateDef',
          name: 'TestF',
          predicate: 'ForAllSuchThat',
          inputDefs: ['TestF', 'a'],
          inputs: [
            {
              type: 'AtomicProposition',
              predicate: { type: 'AtomicPredicate', source: 'IsLessThan' },
              inputs: [{ type: 'NormalInput', inputIndex: 1, children: [] }]
            },
            {
              type: 'AtomicProposition',
              predicate: { type: 'AtomicPredicate', source: 'TestFA' },
              inputs: [
                { type: 'VariableInput', placeholder: 'TestFA', children: [] },
                { type: 'VariableInput', placeholder: 'b', children: [] }
              ]
            }
          ]
        }
      }
    ]
  }

  const deciderManager = initializeDeciderManager()

  it('return Property', async () => {
    const compiledPredicate = new CompiledPredicate(
      compiledPredicateSource,
      deciderManager
    )
    // Create a instance of compiled predicate "TestF(TestF, 10)".
    const property = compiledPredicate.instantiate(
      'TestF',
      TestPredicateAddress,
      [Bytes.fromString('TestF'), Coder.encode(Integer.from(10))]
    )

    expect(property).toEqual({
      deciderAddress: ForAllSuchThatDeciderAddress,
      inputs: [
        Coder.encode(
          new Property(LessThanDeciderAddress, [
            Bytes.fromHexString('0x3130')
          ]).toStruct()
        ),
        Coder.encode(
          new Property(TestPredicateAddress, [
            Bytes.fromHexString('0x546573744641'),
            Bytes.fromHexString('0x5f5f5641524941424c455f5f62')
          ]).toStruct()
        )
      ]
    })
  })
})
