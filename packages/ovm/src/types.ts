import {
  Address,
  Bytes,
  FixedBytes,
  List,
  Struct,
  BigNumber
} from '@cryptoeconomicslab/primitives'
import { TraceInfo } from './Tracer'

export interface Challenge {
  property: Property
  challengeInputs: Bytes[]
}

export interface Decision {
  outcome: boolean
  // witnesses is empty if outcome is false
  witnesses?: Bytes[]
  // challenges is empty if outcome is true
  challenge: Challenge | null
  // traceInfo is the snapshot when false decision is made.
  // If outcome is true, traceInfo is undefined.
  traceInfo?: TraceInfo
}

export class Property {
  public deciderAddress: Address
  public inputs: Bytes[]

  constructor(deciderAddress: Address, inputs: Bytes[]) {
    this.deciderAddress = deciderAddress
    this.inputs = inputs
  }
  public toStruct(): Struct {
    return new Struct([
      {
        key: 'deciderAddress',
        value: this.deciderAddress
      },
      { key: 'inputs', value: new List(Bytes, this.inputs) }
    ])
  }

  public static getParamType(): Struct {
    return Struct.from([
      {
        key: 'deciderAddress',
        value: Address.default()
      },
      { key: 'inputs', value: List.default(Bytes, Bytes.default()) }
    ])
  }

  public static fromStruct(_struct: Struct): Property {
    return new Property(
      _struct.data[0].value as Address,
      (_struct.data[1].value as List<Bytes>).data
    )
  }
}

/**
 * ChallengeGame is a part of L2 dispute. It's instantiated by claiming property.
 * Client can get game instance from Adjudicator Contract.
 * https://github.com/cryptoeconomicslab/ovm-contracts/blob/53aeb7e121473a9d47dbc75d1f2ce4801a29b67e/contracts/DataTypes.sol#L13
 */
export class ChallengeGame {
  constructor(
    readonly propertyHash: FixedBytes,
    readonly challenges: Bytes[],
    readonly decision: boolean,
    readonly createdBlock: BigNumber
  ) {}
}

const createVariableUtility = (prefix: string, prefixRegex: RegExp) => {
  return {
    /**
     * return variable removing prefix if input bytes has prefix defined by prefix_regex
     * otherwise return null
     * @param prefixRegex
     * @param input
     */
    getVariableName: (input: Bytes) => {
      // TODO: we should check length of input because bytes which is larger than 32 byte must not be free variable or label
      const s = input.intoString()
      const result = prefixRegex.exec(s)
      if (result) {
        return result[1] || null
      }
      return null
    },
    from: (name: string): Bytes => Bytes.fromString(`${prefix}${name}`)
  }
}

const VARIABLE_PREFIX = 'V'
const VARIABLE_PREFIX_REGEX = /^V(.*)/
/**
 * Free variable for property to handle quantifier.
 * free variable is a Bytes whose string representation starts from prefix __VARIABLE__.
 */
export const FreeVariable = createVariableUtility(
  VARIABLE_PREFIX,
  VARIABLE_PREFIX_REGEX
)

const LABEL_PREFIX = 'L'
const LABEL_PREFIX_REGEX = /^L(.*)/
/**
 * Label variable for the label of Compiled Predicate.
 * It is used in 0th input of Compiled Predicate.
 */
export const PredicateLabel = createVariableUtility(
  LABEL_PREFIX,
  LABEL_PREFIX_REGEX
)

export enum LogicalConnective {
  And = 'And',
  ForAllSuchThat = 'ForAllSuchThat',
  Not = 'Not',
  Or = 'Or',
  ThereExistsSuchThat = 'ThereExistsSuchThat'
}

export enum AtomicPredicate {
  IsValidPreimage = 'IsValidPreimage',
  IsValidSignature = 'IsValidSignature',
  VerifyInclusion = 'VerifyInclusion',
  IsLessThan = 'IsLessThan',
  Equal = 'Equal',
  Bool = 'Bool',
  LessThan = 'LessThan',
  GreaterThan = 'GreaterThan',
  IsSameAmount = 'IsSameAmount',
  IsContained = 'IsContained',
  IsHashPreimage = 'IsHashPreimage',
  IsStored = 'IsStored',
  HasIntersection = 'HasIntersection'
}

export type LogicalConnectiveStrings = keyof typeof LogicalConnective
export type AtomicPredicateStrings = keyof typeof AtomicPredicate

export function convertStringToLogicalConnective(
  name: LogicalConnectiveStrings
): LogicalConnective {
  return LogicalConnective[name]
}

export function convertStringToAtomicPredicate(
  name: AtomicPredicateStrings
): AtomicPredicate {
  return AtomicPredicate[name]
}
