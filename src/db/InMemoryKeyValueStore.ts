import memdown from 'memdown'
import { LevelKeyValueStore } from './LevelKeyValueStore'
import { Bytes } from '../types'

export class InMemoryKeyValueStore extends LevelKeyValueStore {
  constructor(prefix: Bytes) {
    super(prefix, memdown())
  }
}
