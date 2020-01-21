import { DeciderManager } from './DeciderManager'
import {
  AndDecider,
  ForAllSuchThatDecider,
  NotDecider,
  SampleDecider,
  ThereExistsSuchThatDecider,
  OrDecider,
  IsHashPreimageDecider,
  IsValidSignatureDecider,
  EqualDecider,
  IsLessThanDecider,
  IsSameAmountDecider,
  IsContainedDecider
} from './deciders'
import {
  LogicalConnective,
  LogicalConnectiveStrings,
  AtomicPredicate,
  AtomicPredicateStrings,
  convertStringToLogicalConnective,
  convertStringToAtomicPredicate
} from './types'
import { Address, Bytes } from '@cryptoeconomicslab/primitives'
import { Decider } from './interfaces/Decider'
import { CompiledPredicate, CompiledDecider } from './decompiler'

const deciders: { [key: string]: Decider } = {
  And: new AndDecider(),
  Or: new OrDecider(),
  Not: new NotDecider(),
  ForAllSuchThat: new ForAllSuchThatDecider(),
  ThereExistsSuchThat: new ThereExistsSuchThatDecider(),
  Bool: new SampleDecider(),
  IsContained: new IsContainedDecider(),
  Equal: new EqualDecider(),
  IsLessThan: new IsLessThanDecider(),
  IsValidSignature: new IsValidSignatureDecider(),
  IsSameAmount: new IsSameAmountDecider(),
  IsHashPreimage: new IsHashPreimageDecider()
}

export interface CompiledPredicateConfig {
  deployedAddress: string
  source: string
}

export interface InitilizationConfig {
  logicalConnectiveAddressTable: {
    [key: string]: string
  }
  atomicPredicateAddressTable: {
    [key: string]: string
  }
  deployedPredicateTable: { [key: string]: CompiledPredicateConfig }
  constantVariableTable: { [key: string]: string }
}

export function initialize(
  deciderManager: DeciderManager,
  config: InitilizationConfig
) {
  initializeDeciders(
    deciderManager,
    config.logicalConnectiveAddressTable,
    config.atomicPredicateAddressTable
  )
  const constantVariableTable: { [key: string]: Bytes } = {}
  Object.keys(config.constantVariableTable).forEach(
    k =>
      (constantVariableTable[k] = Bytes.fromHexString(
        config.constantVariableTable[k]
      ))
  )

  initializeCompiledPredicates(
    deciderManager,
    config.deployedPredicateTable,
    constantVariableTable
  )
}

function initializeDeciders(
  deciderManager: DeciderManager,
  logicalConnectiveAddressTable: {
    [key: string]: string
  },
  atomicPredicateAddressTable: {
    [key: string]: string
  }
) {
  const registerDecider = (
    predicateName: AtomicPredicate | LogicalConnective,
    deployedAddress: Address,
    decider: Decider
  ) => {
    deciderManager.setDecider(deployedAddress, decider, predicateName)
  }
  for (const name in logicalConnectiveAddressTable) {
    registerDecider(
      convertStringToLogicalConnective(name as LogicalConnectiveStrings),
      Address.from(logicalConnectiveAddressTable[name]),
      deciders[name]
    )
  }
  for (const name in atomicPredicateAddressTable) {
    registerDecider(
      convertStringToAtomicPredicate(name as AtomicPredicateStrings),
      Address.from(atomicPredicateAddressTable[name]),
      deciders[name]
    )
  }
}

function initializeCompiledPredicates(
  deciderManager: DeciderManager,
  deployedPredicateTable: { [key: string]: CompiledPredicateConfig },
  constantVariableTable: { [key: string]: Bytes }
) {
  const registerPredicate = (
    deployedPredicateInfo: CompiledPredicateConfig
  ) => {
    const predicate = CompiledPredicate.fromSource(
      Address.from(deployedPredicateInfo.deployedAddress),
      deployedPredicateInfo.source
    )
    deciderManager.setCompiledPredicate(predicate.getPredicateName(), predicate)
    const decider = new CompiledDecider(predicate, constantVariableTable)
    deciderManager.setDecider(
      Address.from(deployedPredicateInfo.deployedAddress),
      decider,
      predicate.getPredicateName()
    )
  }
  Object.keys(deployedPredicateTable)
    .map(key => deployedPredicateTable[key])
    .forEach(registerPredicate)
}
