/**
 * PubsubServer is the interface of the server side of network layer.
 */
export interface PubsubServer {
  /**
   * setRecievingHandler sets handler for receiving messages
   * @param handle
   */
  setRecievingHandler(handler: (topic: string, message: string) => void): void

  /**
   * broadcast a message to all clients
   * @param topic
   * @param message
   */
  broadcast(topic: string, message: string): void

  /**
   * close server
   */
  close(): void
}
