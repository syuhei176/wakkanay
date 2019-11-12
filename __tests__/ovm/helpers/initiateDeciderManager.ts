import { DeciderManager } from '../../../src/ovm/DeciderManager'
import {
  AndDecider,
  ForAllSuchThatDecider,
  NotDecider,
  SampleDecider,
  LessThanDecider,
  LessThanQuantifier,
  ThereExistsSuchThatDecider,
  GreaterThanDecider
} from '../../../src/ovm/deciders'
import { LogicalConnective } from '../../../src/ovm/types'
import { Address } from '../../../src/types/Codables'

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

export function initializeDeciderManager() {
  const deciderManager = new DeciderManager()
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
  return deciderManager
}
