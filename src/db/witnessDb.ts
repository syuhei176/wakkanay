import { Bytes } from '../types'

// We want quantify local information freely
interface IWitnessDb {
  store(key: Bytes, witness: Bytes): Promise<Bytes>
  get(key: Bytes): Promise<Bytes>
}
