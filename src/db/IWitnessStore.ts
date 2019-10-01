import { Bytes } from '../types'
import { IKeyValueStore } from './IKeyValueStore'
import { IRangeStore } from './IRangeStore'

// We want quantify local information freely
export interface IWitnessStore {
  storeWitness(key: Bytes, witness: Bytes): Promise<Bytes>
  getWitness(key: Bytes): Promise<Bytes>
}

// create witness store instance by key value store
export function createWitnessStore(kvs: IKeyValueStore): IWitnessStore {
  return {
    getWitness(key: Bytes) {
      return kvs.get(key)
    },
    storeWitness(key: Bytes, value: Bytes) {
      return kvs.put(key, value)
    }
  }
}

export interface IRangeWitnessStore {
  storeWitness(start: number, end: number, witness: Bytes): Promise<Bytes>
  getWitness(start: number, end: number): Promise<Bytes>
}

// create witness store instance by key value store
export function createRangeWitnessStore(kvs: IRangeStore): IRangeWitnessStore {
  return {
    getWitness(start: number, end: number) {
      return kvs.get(start, end)
    },
    storeWitness(start: number, end: number, value: Bytes) {
      return kvs.put(start, end, value)
    }
  }
}
