import { Bytes, Integer } from '../../types/Codables'
import EventLog from './EventLog'
import { Coder } from '../../coder'

export default class BlockSubmitted {
  constructor(readonly blockNumber: number, readonly root: Bytes) {}

  static fromRaw(coder: Coder, event: EventLog): BlockSubmitted {
    const blockNumber = coder.decode(Integer.default(), event.values[0])
    const root = coder.decode(Bytes.default(), event.values[1])

    return new BlockSubmitted(blockNumber.data, root)
  }
}
