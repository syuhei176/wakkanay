import { Bytes } from '@cryptoeconomicslab/primitives'

/**
 * TraceInfo is the snapshot of when decider make false decision
 */
export abstract class TraceInfo {
  constructor(readonly predicateName: string) {}
  abstract toString(): string
  abstract toJson(): any
}

class NormalTraceInfo extends TraceInfo {
  toString(): string {
    return this.predicateName
  }
  toJson() {
    return this.predicateName
  }
}

class ForAllSuchThatTraceInfo extends TraceInfo {
  constructor(readonly variable: Bytes, readonly child: TraceInfo) {
    super('ForAllSuchThat')
  }
  toString(): string {
    return (
      this.predicateName +
      ':' +
      this.variable.toHexString() +
      ',' +
      this.child.toString()
    )
  }
  toJson() {
    return {
      predicateName: this.predicateName,
      variable: this.variable.toHexString(),
      child: this.child.toJson()
    }
  }
}

export class ThereExistsSuchThatTraceInfo extends TraceInfo {
  constructor(readonly child: TraceInfo) {
    super('ThereExistsSuchThat')
  }
  toString(): string {
    return this.predicateName + ',' + this.child.toString()
  }
  toJson() {
    return {
      predicateName: this.predicateName,
      child: this.child.toJson()
    }
  }
}

export class NotTraceInfo extends TraceInfo {
  constructor(readonly child: TraceInfo) {
    super('Not')
  }
  toString(): string {
    return this.predicateName + ',' + this.child.toString()
  }
  toJson() {
    return {
      predicateName: this.predicateName,
      child: this.child.toJson()
    }
  }
}

export class AndTraceInfo extends TraceInfo {
  constructor(readonly index: number, readonly child: TraceInfo) {
    super('And')
  }
  toString(): string {
    return this.predicateName + ':' + this.index + ',' + this.child.toString()
  }
  toJson() {
    return {
      predicateName: this.predicateName,
      index: this.index,
      child: this.child.toJson()
    }
  }
}

class OrTraceInfo extends TraceInfo {
  constructor(readonly children: TraceInfo[]) {
    super('Or')
  }
  toString(): string {
    return (
      this.predicateName + ',' + this.children.map(c => c.toString()).join()
    )
  }
  toJson() {
    return {
      predicateName: this.predicateName,
      children: this.children.map(c => c.toJson())
    }
  }
}

class AtomicPropositionTraceInfo extends TraceInfo {
  constructor(readonly predicateName: string, readonly inputs: Bytes[]) {
    super(predicateName)
  }
  toString(): string {
    return (
      this.predicateName +
      `:[${this.inputs.map(i => i.toHexString()).toString()}]`
    )
  }
  toJson() {
    return {
      predicateName: this.predicateName,
      inputs: this.inputs.map(i => i.toHexString())
    }
  }
}

export class TraceInfoCreator {
  static create(predicateName: string, inputs: Bytes[]) {
    return new AtomicPropositionTraceInfo(predicateName, inputs)
  }

  static createAnd(index: number, child: TraceInfo) {
    return new AndTraceInfo(index, child)
  }

  static createOr(children: TraceInfo[]) {
    return new OrTraceInfo(children)
  }

  static createNot(child: TraceInfo) {
    return new NotTraceInfo(child)
  }

  static createFor(variable: Bytes, child: TraceInfo) {
    return new ForAllSuchThatTraceInfo(variable, child)
  }

  static createThere(child: TraceInfo) {
    return new ThereExistsSuchThatTraceInfo(child)
  }

  static exception(message: string) {
    return new NormalTraceInfo(message)
  }
}
