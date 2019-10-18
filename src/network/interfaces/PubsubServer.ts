/**
 * PubsubServer is the interface of the server side of network layer.
 */
export interface PubsubServer {
  /**
   * setRecievingHandler sets handler for receiving messages
   * @param handle
   */
  setRecievingHandler(handle: (key: string, message: string) => void): void

  /**
   * broadcast a message to all clients
   * @param key
   * @param message
   */
  broadcast(key: string, message: string): void
}
