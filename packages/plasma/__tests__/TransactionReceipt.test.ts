import {
  Integer,
  Address,
  Bytes,
  BigNumber,
  Range
} from '@cryptoeconomicslab/primitives'
import { TransactionReceipt } from '../src'
import Coder from '@cryptoeconomicslab/coder'
import { setupContext } from '@cryptoeconomicslab/context'
setupContext({ coder: Coder })

describe('transaction receipt', () => {
  const receipt = new TransactionReceipt(
    Integer.from(1),
    BigNumber.from(1),
    [BigNumber.from(0), BigNumber.from(0)],
    new Range(BigNumber.from(0), BigNumber.from(10)),
    Address.default(),
    Address.default(),
    Bytes.default()
  )

  test('encode, decode', () => {
    const encoded = Coder.encode(receipt.toStruct())
    const decoded = TransactionReceipt.fromStruct(
      Coder.decode(TransactionReceipt.getParamType(), encoded)
    )
    expect(decoded).toEqual(receipt)
  })
})
