import { Bytes } from '@cryptoeconomicslab/primitives'
import { TraceInfoCreator } from '../src/Tracer'

describe('Tracer', () => {
  describe('TraceInfo', () => {
    const traceInfo = TraceInfoCreator.create('Bool', [
      Bytes.fromHexString('0x01')
    ])

    test('addTraceInfo', async () => {
      const newTraceInfo = TraceInfoCreator.createNot(traceInfo)
      expect(newTraceInfo.toString()).toEqual('Not,Bool:[0x01]')
    })

    test('addAndTraceInfo', async () => {
      const newTraceInfo = TraceInfoCreator.createAnd(0, traceInfo)
      expect(newTraceInfo.toString()).toEqual('And:0,Bool:[0x01]')
    })

    test('addForAllSuchThatTraceInfo', async () => {
      const newTraceInfo = TraceInfoCreator.createFor(
        Bytes.fromHexString('0x01'),
        traceInfo
      )
      expect(newTraceInfo.toString()).toEqual('ForAllSuchThat:0x01,Bool:[0x01]')
    })

    test('toString', async () => {
      expect(traceInfo.toString()).toEqual('Bool:[0x01]')
    })
  })
})
