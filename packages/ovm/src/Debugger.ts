import { Bytes } from '@cryptoeconomicslab/primitives'

abstract class DecisionDebugInfo {
  constructor(readonly predicateName: string) {}
  abstract toString(): string
}

export class NormalDebugInfo extends DecisionDebugInfo {
  toString(): string {
    return this.predicateName
  }
}

export class QuantifierDecisionDebugInfo extends DecisionDebugInfo {
  constructor(readonly predicateName: string, readonly variable: Bytes) {
    super(predicateName)
  }
  toString(): string {
    return this.predicateName + ':' + this.variable.toHexString()
  }
}

export class AndDecisionDebugInfo extends DecisionDebugInfo {
  constructor(readonly index: number) {
    super('And')
  }
  toString(): string {
    return this.predicateName + ':' + this.index
  }
}

export class AtomicPropositionDecisionDebugInfo extends DecisionDebugInfo {
  constructor(readonly predicateName: string, readonly inputs: Bytes[]) {
    super(predicateName)
  }
  toString(): string {
    return (
      this.predicateName +
      `:[${this.inputs.map(i => i.toHexString()).toString()}]`
    )
  }
}

/**
 * DebugInfo is debug result of decider
 */
export class DebugInfo {
  /**
   *
   * @param decisionDebugInfos The decisionDebugInfo from the property is decided false
   */
  constructor(readonly decisionDebugInfos: DecisionDebugInfo[]) {}

  addDecisionDebugInfo(newDecisionDebugInfo: DecisionDebugInfo): DebugInfo {
    return new DebugInfo([newDecisionDebugInfo].concat(this.decisionDebugInfos))
  }

  toString(splitter?: string): string {
    return this.decisionDebugInfos
      .map(decisionDebugInfo => decisionDebugInfo.toString())
      .join(splitter || ',')
  }

  static create(predicateName: string, inputs: Bytes[]) {
    return new DebugInfo([
      new AtomicPropositionDecisionDebugInfo(predicateName, inputs)
    ])
  }
}
