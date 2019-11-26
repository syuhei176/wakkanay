import { Bytes } from '../types/Codables'
import { KeyValueStore } from './KeyValueStore'
import { RangeRecord as Range, RangeStore } from './RangeStore'

// We want quantify local information freely
export interface WitnessStore {
  storeWitness(key: Bytes, witness: Bytes): Promise<void>
  getWitness(key: Bytes): Promise<Bytes | null>
}

// create witness store instance by key value store
export function createWitnessStore(kvs: KeyValueStore): WitnessStore {
  return {
    getWitness(key: Bytes) {
      return kvs.get(key)
    },
    storeWitness(key: Bytes, value: Bytes) {
      return kvs.put(key, value)
    }
  }
}

export interface RangeWitnessStore {
  storeWitness(start: bigint, end: bigint, witness: Bytes): Promise<void>
  getWitness(start: bigint, end: bigint): Promise<Range[]>
}

// create witness store instance by key value store
export function createRangeWitnessStore(kvs: RangeStore): RangeWitnessStore {
  return {
    getWitness(start: bigint, end: bigint) {
      return kvs.get(start, end)
    },
    storeWitness(start: bigint, end: bigint, value: Bytes) {
      return kvs.put(start, end, value)
    }
  }
}
