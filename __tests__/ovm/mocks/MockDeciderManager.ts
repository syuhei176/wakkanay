import { Bytes } from '../../../src/types/Codables'
import { Property, Decision } from '../../../src/ovm/types'
import { DeciderManagerInterface } from '../../../src/ovm'

export class MockDeciderManager implements DeciderManagerInterface {
  constructor(readonly decision: Decision) {}
  public async decide(
    property: Property,
    substitutions: { [key: string]: Bytes } = {}
  ): Promise<Decision> {
    return this.decision
  }
}
