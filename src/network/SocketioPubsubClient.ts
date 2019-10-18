import { Socket, connect } from 'socket.io-client'
import { PubsubClient } from './interfaces/PubsubClient'

/**
 * SocketioPubsubClient is the socket.io implementation for PubsubClient.
 */
export class SocketioPubsubClient implements PubsubClient {
  socket: typeof Socket
  /**
   * constructor
   * @param aggregatorEndpoint aggregator endpoint
   */
  constructor(aggregatorEndpoint: string) {
    this.socket = connect(
      aggregatorEndpoint || 'http://localhost:3000',
      { transports: ['websocket'] }
    )
  }

  /**
   * publish
   * publish method sends message to socket.io server.
   */
  publish(key: string, value: string): void {
    this.socket.emit(key, value)
  }

  /**
   * subscribe
   * subscribes to socket.io server.
   */
  subscribe(
    key: string,
    handler: (key: string, message: string) => void
  ): void {
    this.socket.on(key, handler)
  }

  /**
   * unsubscribe
   * unsubscribe to socket.io server.
   */
  unsubscribe(
    key: string,
    handler: (key: string, message: string) => void
  ): void {
    this.socket.off(key, handler)
  }
}
