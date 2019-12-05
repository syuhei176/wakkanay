import { Property } from '../../../src/ovm/types'
import { Address, Bytes, Integer } from '../../../src/types/Codables'
import DefaultCoder from '../../../src/coder'
import {
  initializeDeciderManager,
  ForAllSuchThatDeciderAddress
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
              predicate: { type: 'AtomicPredicate', source: 'LessThan' },
              inputs: [{ type: 'NormalInput', inputIndex: 1, children: [] }]
            },
            {
              type: 'AtomicProposition',
              predicate: { type: 'AtomicPredicate', source: 'TestFA' },
              inputs: [
                {
                  type: 'VariableInput',
                  placeholder: 'TestFA',
                  children: []
                },
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
        Bytes.fromHexString(
          '0x5b22307830323530303335303030333031303130303032303030393030333830303035373030303630303031222c5b22307833313330225d5d'
        ),
        Bytes.fromHexString(
          '0x5b22307830323530303335303030333031303130303032303030393030333830303035373030303630303031222c5b223078356635663536343135323439343134323463343535663566353436353733373434363431222c2230783566356635363431353234393431343234633435356635663632225d5d'
        )
      ]
    })
  })
})
