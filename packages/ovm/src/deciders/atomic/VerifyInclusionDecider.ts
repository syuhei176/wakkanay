import {
  Address,
  Bytes,
  FixedBytes,
  Range
} from '@cryptoeconomicslab/primitives'
import { Decider } from '../../interfaces/Decider'
import { Decision } from '../../types'
import { DeciderManagerInterface } from '../../DeciderManager'
import {
  DoubleLayerTreeVerifier,
  DoubleLayerTreeLeaf,
  DoubleLayerInclusionProof
} from '@cryptoeconomicslab/merkle-tree'
import { decodeStructable } from '@cryptoeconomicslab/coder'
import { Keccak256 } from '@cryptoeconomicslab/hash'

/**
 * VerifyInclusionDecider verifies double layer merkle tree
 * inputs: Array<Bytes> [rawLeafData, tokenAddress, range, inclusionProof, root]
 */
export class VerifyInclusionDecider implements Decider {
  public async decide(
    manager: DeciderManagerInterface,
    inputs: Bytes[]
  ): Promise<Decision> {
    if (inputs.length !== 5) {
      return {
        outcome: false,
        challenges: []
      }
    }

    const { coder } = ovmContext
    const verifier = new DoubleLayerTreeVerifier()

    const leafData = coder.decode(
      FixedBytes.default(32),
      Keccak256.hash(inputs[0])
    )
    const tokenAddress = coder.decode(Address.default(), inputs[1])
    const range = decodeStructable(Range, coder, inputs[2])
    const leaf = new DoubleLayerTreeLeaf(tokenAddress, range.start, leafData)
    const inclusionProof = decodeStructable(
      DoubleLayerInclusionProof,
      coder,
      inputs[3]
    )
    const root = coder.decode(FixedBytes.default(32), inputs[4])

    return {
      outcome: verifier.verifyInclusion(leaf, range, root, inclusionProof),
      challenges: []
    }
  }
}
