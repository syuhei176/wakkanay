import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import { PubsubServer } from './interfaces/PubsubServer'
import { EventEmitter } from 'events'

/**
 * SocketioPubsubClient is the socket.io implementation for PubsubClient.
 */
export class SocketioPubsubServer implements PubsubServer {
  private port: number
  private ee: EventEmitter
  private server: http.Server
  /**
   * constructor
   * @param aggregatorEndpoint aggregator endpoint
   */
  constructor(port: number) {
    this.port = port
    this.ee = new EventEmitter()
    const app = express()
    const server = http.createServer(app)
    const io = socketio(server)

    io.on('connection', socket => {
      socket.use((packet, next) => {
        this.ee.emit('recieve', packet)
        return next()
      })
    })

    server.listen(this.port, () => {})
    this.server = server
  }

  /**
   * recieve
   */
  public setRecievingHandler(
    handler: (topic: string, message: string) => void
  ): void {
    this.ee.on('recieve', e => {
      handler(e[0], e[1])
    })
  }

  /**
   * subscribe
   * subscribes to socket.io server.
   */
  public broadcast(topic: string, message: string): void {
    throw new Error('Not implemented')
  }

  /**
   * close server
   */
  public close(): void {
    this.server.close()
  }
}
