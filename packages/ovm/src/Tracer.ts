import { Bytes } from '@cryptoeconomicslab/primitives'

abstract class DecisionTraceInfo {
  constructor(readonly predicateName: string) {}
  abstract toString(): string
}

class NormalTraceInfo extends DecisionTraceInfo {
  toString(): string {
    return this.predicateName
  }
}

class ForAllSuchThatDecisionTraceInfo extends DecisionTraceInfo {
  constructor(readonly variable: Bytes) {
    super('ForAllSuchThat')
  }
  toString(): string {
    return this.predicateName + ':' + this.variable.toHexString()
  }
}

class AndDecisionTraceInfo extends DecisionTraceInfo {
  constructor(readonly index: number) {
    super('And')
  }
  toString(): string {
    return this.predicateName + ':' + this.index
  }
}

class AtomicPropositionTraceInfo extends DecisionTraceInfo {
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
 * TraceInfo is debug result of decider
 */
export class TraceInfo {
  /**
   *
   * @param decisionTraceInfos The decisionTraceInfo from the property is decided false
   */
  constructor(readonly decisionTraceInfos: DecisionTraceInfo[]) {}

  private addDecisionTraceInfo(
    newDecisionTraceInfo: DecisionTraceInfo
  ): TraceInfo {
    return new TraceInfo([newDecisionTraceInfo].concat(this.decisionTraceInfos))
  }

  addForAllSuchThatTraceInfo(variable: Bytes): TraceInfo {
    return this.addDecisionTraceInfo(
      new ForAllSuchThatDecisionTraceInfo(variable)
    )
  }

  addAndTraceInfo(index: number): TraceInfo {
    return this.addDecisionTraceInfo(new AndDecisionTraceInfo(index))
  }

  addTraceInfo(predicateName: string): TraceInfo {
    return this.addDecisionTraceInfo(new NormalTraceInfo(predicateName))
  }

  toString(splitter?: string): string {
    return this.decisionTraceInfos
      .map(decisionTraceInfo => decisionTraceInfo.toString())
      .join(splitter || ',')
  }

  static create(predicateName: string, inputs: Bytes[]) {
    return new TraceInfo([
      new AtomicPropositionTraceInfo(predicateName, inputs)
    ])
  }

  static exception(message: string) {
    return new TraceInfo([new NormalTraceInfo(message)])
  }
}
