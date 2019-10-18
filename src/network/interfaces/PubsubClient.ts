/**
 * PubsubClient is the interface of network layer of our framework
 */
export interface PubsubClient {
  /**
   * publish
   * publish method sends message to the network.
   */
  publish(key: string, message: string): void

  /**
   * subscribe
   * subscribes to the network with `key`
   */
  subscribe(key: string, handle: (key: string, message: string) => void): void

  /**
   * unsubscribe
   * unsubscribe from the network with `key`
   */
  unsubscribe(
    key: string,
    handler: (key: string, message: string) => void
  ): void
}
