import { SocketioPubsubClient, SocketioPubsubServer } from '../../src/network'

describe('SocketioPubsubClient', () => {
  it('should send a message', done => {
    const port = 3000
    const server = new SocketioPubsubServer(port)
    server.setRecievingHandler((key, message) => {
      expect(message).toBe('message')
      server.close()
      done()
    })
    const client = new SocketioPubsubClient('http://localhost:3000')
    client.publish('aaa', 'message')
  })
})
