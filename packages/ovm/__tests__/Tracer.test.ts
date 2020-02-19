import { Bytes } from '@cryptoeconomicslab/primitives'
import { TraceInfo } from '../src/Tracer'

describe('Tracer', () => {
  describe('TraceInfo', () => {
    const traceInfo = TraceInfo.create('Bool', [Bytes.fromHexString('0x01')])

    test('addTraceInfo', async () => {
      const newTraceInfo = traceInfo.addTraceInfo('Not')
      expect(newTraceInfo.toString()).toEqual('Not,Bool:[0x01]')
    })

    test('addAndTraceInfo', async () => {
      const newTraceInfo = traceInfo.addAndTraceInfo(0)
      expect(newTraceInfo.toString()).toEqual('And:0,Bool:[0x01]')
    })

    test('addForAllSuchThatTraceInfo', async () => {
      const newTraceInfo = traceInfo.addForAllSuchThatTraceInfo(
        Bytes.fromHexString('0x01')
      )
      expect(newTraceInfo.toString()).toEqual('ForAllSuchThat:0x01,Bool:[0x01]')
    })

    test('toString', async () => {
      expect(traceInfo.toString()).toEqual('Bool:[0x01]')
    })
  })
})
