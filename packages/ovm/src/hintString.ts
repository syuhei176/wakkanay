import { replaceHint } from '@cryptoeconomicslab/db'
import {
  BigNumber,
  Address,
  Range,
  Bytes
} from '@cryptoeconomicslab/primitives'

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

export const createTxHint = (
  blockNumber: BigNumber,
  depositContractAddress: Address,
  range: Range
) => {
  const { coder } = ovmContext
  return replaceHint('tx.block${b}.range${token},RANGE,${range}', {
    b: coder.encode(blockNumber),
    token: coder.encode(depositContractAddress),
    range: coder.encode(range.toStruct())
  })
}

export const createSignatureHint = (message: Bytes) => {
  return replaceHint('signatures,KEY,${m}', {
    m: message
  })
}

export const createRootHint = (
  blockNumber: BigNumber,
  commitmentContractAddress: Address
) => {
  const { coder } = ovmContext
  return replaceHint('stored.${contract},KEY,${key}', {
    contract: coder.encode(commitmentContractAddress),
    key: coder.encode(blockNumber)
  })
}

export const createStateUpdateHint = (
  blockNumber: BigNumber,
  depositContractAddress: Address,
  range: Range
) => {
  const { coder } = ovmContext
  return replaceHint('su.block${b}.range${token},RANGE,${range}', {
    b: coder.encode(blockNumber),
    token: coder.encode(depositContractAddress),
    range: coder.encode(range.toStruct())
  })
}
