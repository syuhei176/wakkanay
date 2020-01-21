import { Bytes, Integer } from '@cryptoeconomicslab/primitives'
import { Coder } from '@cryptoeconomicslab/coder'
import EventLog from './EventLog'

export default class BlockSubmitted {
  constructor(readonly blockNumber: number, readonly root: Bytes) {}

  static fromRaw(coder: Coder, event: EventLog): BlockSubmitted {
    const blockNumber = coder.decode(Integer.default(), event.values[0])
    const root = coder.decode(Bytes.default(), event.values[1])

    return new BlockSubmitted(blockNumber.data, root)
  }
}
