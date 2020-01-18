import { IEventWatcherFactory, EventWatcherArg } from './IEventWatcherFactory'
import { IEventWatcher } from './IEventWatcher'
import BlockSubmitted from '../types/BlockSubmitted'
import EventLog from '../types/EventLog'
import { Coder } from '@cryptoeconomicslab/coder'

type Listener = (event: BlockSubmitted) => void

export default class CommitmentContractWatcher {
  private inner: IEventWatcher
  private listeners: Map<Listener, any> = new Map()

  constructor(
    factory: IEventWatcherFactory,
    arg: EventWatcherArg,
    readonly coder: Coder
  ) {
    this.inner = factory.create(arg)
  }

  subscribeBlockSubmittedEvent(handler: Listener) {
    const listener = (e: EventLog) => {
      const blockSubmitted = BlockSubmitted.fromRaw(this.coder, e)
      handler(blockSubmitted)
    }
    this.listeners.set(handler, listener)
    this.inner.subscribe('block_submitted', listener)
  }

  unsubscribeBlockSubmittedEvent(handler: Listener) {
    const listener = this.listeners.get(handler)
    if (listener) {
      this.inner.unsubscribe('block_submitted', listener)
    }
  }
}
