import { DeciderManager } from '../../../src/ovm/DeciderManager'
import {
  AndDecider,
  ForAllSuchThatDecider,
  NotDecider,
  SampleDecider,
  LessThanDecider,
  LessThanQuantifier,
  ThereExistsSuchThatDecider,
  GreaterThanDecider,
  OrDecider,
  IsHashPreimageDecider,
  IsValidSignatureDecider
} from '../../../src/ovm/deciders'
import { LogicalConnective } from '../../../src/ovm/types'
import { Address, Bytes } from '../../../src/types/Codables'
import { InMemoryKeyValueStore } from '../../../src/db'

export const SampleDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000001'
)
export const NotDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000002'
)
export const AndDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000003'
)
export const ForAllSuchThatDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000004'
)
export const LessThanQuantifierAddress = Address.from(
  '0x0000000000000000000000000000000000000005'
)
export const LessThanDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000006'
)
export const GreaterThanDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000007'
)
export const ThereExistsSuchThatDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000008'
)
export const OrDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000009'
)
export const IsHashPreimageDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000019'
)
export const IsValidSignatureDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000020'
)

export function initializeDeciderManager() {
  const witnessDb = new InMemoryKeyValueStore(Bytes.fromString('test'))
  const deciderManager = new DeciderManager(witnessDb)
  deciderManager.setDecider(SampleDeciderAddress, new SampleDecider())
  deciderManager.setDecider(
    NotDeciderAddress,
    new NotDecider(),
    LogicalConnective.Not
  )
  deciderManager.setDecider(
    AndDeciderAddress,
    new AndDecider(),
    LogicalConnective.And
  )
  deciderManager.setDecider(
    OrDeciderAddress,
    new OrDecider(),
    LogicalConnective.Or
  )
  deciderManager.setDecider(LessThanDeciderAddress, new LessThanDecider())
  deciderManager.setDecider(
    ForAllSuchThatDeciderAddress,
    new ForAllSuchThatDecider(),
    LogicalConnective.ForAllSuchThat
  )
  deciderManager.setQuantifier(
    LessThanQuantifierAddress,
    new LessThanQuantifier()
  )
  deciderManager.setDecider(GreaterThanDeciderAddress, new GreaterThanDecider())
  deciderManager.setDecider(
    ThereExistsSuchThatDeciderAddress,
    new ThereExistsSuchThatDecider(),
    LogicalConnective.ThereExistsSuchThat
  )
  deciderManager.setDecider(
    IsHashPreimageDeciderAddress,
    new IsHashPreimageDecider()
  )
  deciderManager.setDecider(
    IsHashPreimageDeciderAddress,
    new IsHashPreimageDecider()
  )
  deciderManager.setDecider(
    IsValidSignatureDeciderAddress,
    new IsValidSignatureDecider()
  )

  return deciderManager
}
