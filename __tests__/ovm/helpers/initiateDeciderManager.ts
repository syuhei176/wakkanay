import { DeciderManager } from '../../../src/ovm/DeciderManager'
import {
  AndDecider,
  NotDecider,
  SampleDecider
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
  return deciderManager
}
