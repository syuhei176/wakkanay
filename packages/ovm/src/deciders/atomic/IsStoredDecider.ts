import { Bytes } from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'

/**
 * IsStoredDecider decides to true if certain value is stored
 */
export class IsStoredDecider implements Decider {
  public async decide(
    manager: DeciderManagerInterface,
    inputs: Bytes[]
  ): Promise<Decision> {
    const address = inputs[0]
    const key = inputs[1]
    const expectedValue = inputs[2]

    const db = await manager.getStorageDb()
    const bucket = await db.bucket(address)
    const actualValue = await bucket.get(key)

    return {
      outcome: !!actualValue?.equals(expectedValue),
      challenge: null
    }
  }
}
