import { replaceHint } from '@cryptoeconomicslab/db'
import { BigNumber, Address, Range } from '@cryptoeconomicslab/primitives'

export const createInclusionProofHint = (
  blockNumber: BigNumber,
  depositContractAddress: Address,
  range: Range
) => {
  const { coder } = ovmContext
  return replaceHint('proof.block${b}.range${token},RANGE,${range}', {
    b: coder.encode(blockNumber),
    token: coder.encode(depositContractAddress),
    range: coder.encode(range.toStruct())
  })
}
