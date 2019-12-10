import { Bytes, Address } from '../../../src/types/Codables'
import { Property, Decision } from '../../../src/ovm/types'
import {
  AtomicPredicate,
  DeciderManagerInterface,
  LogicalConnective,
  OrDecider
} from '../../../src/ovm'

const BoolDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000001'
)
const NotDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000002'
)
const AndDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000003'
)
const ForAllSuchThatDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000004'
)
const OrDeciderAddress = Address.from(
  '0x0000000000000000000000000000000000000009'
)

export class MockDeciderManager implements DeciderManagerInterface {
  constructor() {}
  public async decide(
    property: Property,
    substitutions: { [key: string]: Bytes } = {}
  ): Promise<Decision> {
    return {
      outcome:
        property.inputs.length > 0 &&
        property.inputs[0].intoString() === 'true',
      challenges: []
    }
  }
  getDeciderAddress(operator: LogicalConnective | AtomicPredicate): Address {
    if (operator == LogicalConnective.Not) {
      return NotDeciderAddress
    } else if (operator == LogicalConnective.And) {
      return AndDeciderAddress
    } else if (operator == LogicalConnective.ForAllSuchThat) {
      return ForAllSuchThatDeciderAddress
    } else if (operator == LogicalConnective.Or) {
      return OrDeciderAddress
    } else if (operator == AtomicPredicate.Bool) {
      return BoolDeciderAddress
    } else {
      throw new Error(`perator ${operator} is not registered.`)
    }
  }
}
