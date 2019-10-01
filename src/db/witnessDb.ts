import { Bytes } from '../types/types'

// We want quantify local information freely
interface WitnessDbInterface {
  store(key: Bytes, witness: Bytes): Promise<Bytes>
  get(key: Bytes): Promise<Bytes>
}
