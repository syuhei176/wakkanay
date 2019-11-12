import * as ethers from 'ethers'
import Contract = ethers.Contract
import EventFilter = ethers.EventFilter
import Listener = ethers.providers.Listener
import { Integer } from '../../../src/types/Codables'
import { Property } from '../../../src/ovm/types'

export class MockContract extends Contract {
  constructor() {
    super('', '[]', ethers.getDefaultProvider())
  }
  deploy() {}
  deployed(): Promise<Contract> {
    throw new Error('not implemented')
  }
  _deployed(blockTag?: ethers.providers.BlockTag): Promise<Contract> {
    throw new Error('not implemented')
  }
  fallback(
    overrides?: ethers.providers.TransactionRequest
  ): Promise<ethers.providers.TransactionResponse> {
    throw new Error('not implemented')
  }
  connect(
    signerOrProvider: ethers.Signer | ethers.providers.Provider | string
  ): Contract {
    throw new Error('not implemented')
  }
  attach(addressOrName: string): Contract {
    throw new Error('not implemented')
  }
  static isIndexed(value: any): value is ethers.utils.Indexed {
    throw new Error('not implemented')
  }
  on(event: EventFilter | string, listener: Listener): Contract {
    throw new Error('not implemented')
  }
  once(event: EventFilter | string, listener: Listener): Contract {
    throw new Error('not implemented')
  }
  addListener(eventName: EventFilter | string, listener: Listener): Contract {
    throw new Error('not implemented')
  }
  emit(eventName: EventFilter | string, ...args: Array<any>): boolean {
    throw new Error('not implemented')
  }
  listenerCount(eventName?: EventFilter | string): number {
    throw new Error('not implemented')
  }
  listeners(eventName: EventFilter | string): Array<Listener> {
    throw new Error('not implemented')
  }
  removeAllListeners(eventName: EventFilter | string): Contract {
    throw new Error('not implemented')
  }
  removeListener(eventName: any, listener: Listener): Contract {
    throw new Error('not implemented')
  }
  // mock
  async deposit(amout: Integer, stateObject: Property) {}
}
