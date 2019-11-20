export { IEventWatcher } from './IEventWatcher'

export type EventWatcherArg = any
export interface IEventWatcherFactory {
  create(options: any): IEventWatcher
}
