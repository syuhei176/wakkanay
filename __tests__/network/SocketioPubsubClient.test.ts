import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import { SocketioPubsubClient, SocketioPubsubServer } from '../../src/network'

describe('SocketioPubsubClient', () => {
  it('should send a message', done => {
    const server = new SocketioPubsubServer(3000)
    server.setRecievingHandler((key, message) => {
      expect(message).toBe('message')
      done()
    })
    const client = new SocketioPubsubClient('http://localhost:3000')
    client.publish('aaa', 'message')
  })
})
