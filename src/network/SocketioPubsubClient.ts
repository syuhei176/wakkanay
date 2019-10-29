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
  publish(topic: string, value: string): void {
    this.socket.emit(topic, value)
  }

  /**
   * subscribe
   * subscribes to socket.io server.
   */
  subscribe(
    topic: string,
    handler: (topic: string, message: string) => void
  ): void {
    this.socket.on(topic, handler)
  }

  /**
   * unsubscribe
   * unsubscribe to socket.io server.
   */
  unsubscribe(
    topic: string,
    handler: (topic: string, message: string) => void
  ): void {
    this.socket.off(topic, handler)
  }
}
