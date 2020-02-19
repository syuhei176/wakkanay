import { Bytes } from '@cryptoeconomicslab/primitives'

abstract class DecisionDebugInfo {
  constructor(readonly predicateName: string) {}
  abstract toString(): string
}

class NormalDebugInfo extends DecisionDebugInfo {
  toString(): string {
    return this.predicateName
  }
}

class ForAllSuchThatDecisionDebugInfo extends DecisionDebugInfo {
  constructor(readonly variable: Bytes) {
    super('ForAllSuchThat')
  }
  toString(): string {
    return this.predicateName + ':' + this.variable.toHexString()
  }
}

class AndDecisionDebugInfo extends DecisionDebugInfo {
  constructor(readonly index: number) {
    super('And')
  }
  toString(): string {
    return this.predicateName + ':' + this.index
  }
}

class AtomicPropositionDebugInfo extends DecisionDebugInfo {
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

  private addDecisionDebugInfo(
    newDecisionDebugInfo: DecisionDebugInfo
  ): DebugInfo {
    return new DebugInfo([newDecisionDebugInfo].concat(this.decisionDebugInfos))
  }

  addForAllSuchThatDebugInfo(variable: Bytes): DebugInfo {
    return this.addDecisionDebugInfo(
      new ForAllSuchThatDecisionDebugInfo(variable)
    )
  }

  addAndDebugInfo(index: number): DebugInfo {
    return this.addDecisionDebugInfo(new AndDecisionDebugInfo(index))
  }

  addDebugInfo(predicateName: string): DebugInfo {
    return this.addDecisionDebugInfo(new NormalDebugInfo(predicateName))
  }

  toString(splitter?: string): string {
    return this.decisionDebugInfos
      .map(decisionDebugInfo => decisionDebugInfo.toString())
      .join(splitter || ',')
  }

  static create(predicateName: string, inputs: Bytes[]) {
    return new DebugInfo([
      new AtomicPropositionDebugInfo(predicateName, inputs)
    ])
  }

  static exception(message: string) {
    return new DebugInfo([new NormalDebugInfo(message)])
  }
}
