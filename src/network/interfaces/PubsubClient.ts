/**
 * PubsubClient is the interface of network layer of our framework
 */
export interface PubsubClient {
  /**
   * publish
   * publish method sends message to the network.
   */
  publish(topic: string, message: string): void

  /**
   * subscribe
   * subscribes to the network with `topic`
   */
  subscribe(
    topic: string,
    handle: (topic: string, message: string) => void
  ): void

  /**
   * unsubscribe
   * unsubscribe from the network with `topic`
   */
  unsubscribe(
    topic: string,
    handler: (topic: string, message: string) => void
  ): void
}
