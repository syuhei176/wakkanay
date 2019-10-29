import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import { PubsubServer } from './interfaces/PubsubServer'
import { EventEmitter } from 'events'

/**
 * SocketioPubsubClient is the socket.io implementation for PubsubClient.
 */
export class SocketioPubsubServer implements PubsubServer {
  port: number
  ee: EventEmitter
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
        console.log('packet', packet)
        this.ee.emit('recieve', packet)
        return next()
      })
    })

    server.listen(this.port, () => {})
  }

  /**
   * recieve
   */
  setRecievingHandler(handler: (topic: string, message: string) => void): void {
    this.ee.on('recieve', e => {
      handler(e[0], e[1])
    })
  }

  /**
   * subscribe
   * subscribes to socket.io server.
   */
  broadcast(topic: string, message: string): void {}
}
