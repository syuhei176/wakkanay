import { Bytes } from '@cryptoeconomicslab/primitives'
import { DebugInfo } from '../src/Debugger'

describe('Debugger', () => {
  describe('DebugInfo', () => {
    const debugInfo = DebugInfo.create('Bool', [Bytes.fromHexString('0x01')])

    test('addDebugInfo', async () => {
      const newDebugInfo = debugInfo.addDebugInfo('Not')
      expect(newDebugInfo.toString()).toEqual('Not,Bool:[0x01]')
    })

    test('addAndDebugInfo', async () => {
      const newDebugInfo = debugInfo.addAndDebugInfo(0)
      expect(newDebugInfo.toString()).toEqual('And:0,Bool:[0x01]')
    })

    test('addForAllSuchThatDebugInfo', async () => {
      const newDebugInfo = debugInfo.addForAllSuchThatDebugInfo(
        Bytes.fromHexString('0x01')
      )
      expect(newDebugInfo.toString()).toEqual('ForAllSuchThat:0x01,Bool:[0x01]')
    })

    test('toString', async () => {
      expect(debugInfo.toString()).toEqual('Bool:[0x01]')
    })
  })
})
