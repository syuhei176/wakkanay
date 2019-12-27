import leveldown from 'leveldown'
import { LevelKeyValueStore } from './LevelKeyValueStore'
import { Bytes } from '../types'
import os from 'os'
import path from 'path'

export class LevelDownKeyValueStore extends LevelKeyValueStore {
  constructor(
    prefix: Bytes,
    public readonly location: string = path.join(os.tmpdir(), 'testdb')
  ) {
    super(prefix, leveldown(location))
  }
}
