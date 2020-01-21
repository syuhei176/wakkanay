import { KeyValueStore } from '@cryptoeconomicslab/db'
import { Bytes } from '@cryptoeconomicslab/primitives'

export class EventDb {
  kvs: KeyValueStore

  constructor(kvs: KeyValueStore) {
    // TODO: fix
    // this.kvs = kvs.bucket(Bytes.fromString('event_db'))
    this.kvs = kvs
  }

  public async getLastLoggedBlock(topic: Bytes): Promise<number> {
    const result = await this.kvs.get(topic)
    return result === null ? 0 : parseInt(result.intoString())
  }

  public async setLastLoggedBlock(topic: Bytes, loaded: number): Promise<void> {
    await this.kvs.put(topic, Bytes.fromString(loaded.toString()))
  }

  public async addSeen(event: Bytes): Promise<void> {
    await this.kvs.put(event, Bytes.fromString('true'))
  }

  public async getSeen(event: Bytes): Promise<boolean> {
    const result = await this.kvs.get(event)
    return result !== null
  }
}
