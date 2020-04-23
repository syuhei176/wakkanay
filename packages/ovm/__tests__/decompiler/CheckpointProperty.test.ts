import { Wallet } from 'ethers'
import {
  Address,
  Range,
  BigNumber,
  Bytes,
  FixedBytes
} from '@cryptoeconomicslab/primitives'
import { EthCoder as Coder } from '@cryptoeconomicslab/eth-coder'
import { Secp256k1Signer } from '@cryptoeconomicslab/signature'
import { setupContext } from '@cryptoeconomicslab/context'
import {
  initializeDeciderManager,
  SampleDeciderAddress
} from '../helpers/initiateDeciderManager'
import { Transaction, StateUpdate } from '@cryptoeconomicslab/plasma'
import {
  Property,
  CompiledDecider,
  CompiledPredicate,
  DeciderManager,
  LogicalConnective,
  FreeVariable,
  encodeProperty
} from '../../src'
import { putWitness, replaceHint, getWitnesses } from '@cryptoeconomicslab/db'
import {
  DoubleLayerInclusionProof,
  IntervalTreeInclusionProof,
  IntervalTreeNode,
  AddressTreeInclusionProof,
  AddressTreeNode,
  DoubleLayerTreeGenerator,
  DoubleLayerTreeLeaf,
  DoubleLayerTreeVerifier
} from '@cryptoeconomicslab/merkle-tree'
import { Keccak256 } from '@cryptoeconomicslab/hash'
setupContext({ coder: Coder })

// Setting up predicates
const OWNERSHIP_SOURCE = `
@library
@quantifier("signatures,KEY,\${m}")
def SignedBy(sig, m, signer) := IsValidSignature(m, sig, signer, $secp256k1)
def ownership(owner, tx) := SignedBy(tx, owner).any()
`

const STATEUPDATE_SOURCE = `
@library
def IsValidTx(tx, token, range, block_number) :=
  Equal(tx.address, $txAddress)
  and Equal(tx.0, token)
  and IsContained(range, tx.1)
  and IsLessThan(block_number, tx.2)

@library
@quantifier("tx.block\${b}.range\${token},RANGE,\${range}")
def Tx(tx, token, range, b) :=
  IsValidTx(tx, token, range, b)

def stateUpdate(token, range, block_number, so) :=
  Tx(token, range, block_number).any(tx ->
    so(tx)
  )
`

const CHECKPOINT_SOURCE = `
@library
@quantifier("stored.\${contract},KEY,\${key}")
def Stored(value, contract, key) := IsStored(contract, key, value)

@library
@quantifier("proof.block\${b}.range\${token},RANGE,\${range}")
def IncludedAt(proof, leaf, token, range, b, commitmentContract) :=
  Stored(commitmentContract, b).any(root ->
    VerifyInclusion(leaf, token, range, proof, root)
  )

@library
@quantifier("range,NUMBER,\${zero}-\${upper_bound}")
def LessThan(n, upper_bound) :=
  IsLessThan(n, upper_bound)

@library
@quantifier("so.block\${b}.range\${token},RANGE,\${range}")
def SU(so, token, range, b) :=
  IncludedAt(so, token, range, b, $commitmentContract).any()

def checkpoint(su, proof) :=
  Stored($commitmentContract, su.2).any(root ->
    VerifyInclusion(su.3, su.0, su.1, proof, root)
  )
  and LessThan(su.2).all(b -> 
    SU(su.0, su.1, b).all(old_su -> old_su())
  )
`

const commitmentContractAddress = Address.from(
  '0x4444444444444444444444444444444444444444'
)
const txAddress = Address.from('0x7777777777777777777777777777777777777777')

// setup deciders
const stateUpdateAddress = Address.from(
  '0x0250035000301010002000900380005700060000'
)
const stateUpdatePredicate = CompiledPredicate.fromSource(
  stateUpdateAddress,
  STATEUPDATE_SOURCE
)
const stateUpdateDecider = new CompiledDecider(stateUpdatePredicate, {
  txAddress: Coder.encode(txAddress)
})

const checkpointAddress = Address.from(
  '0x0250035000301010002000900380005700060001'
)
const checkpointPredicate = CompiledPredicate.fromSource(
  checkpointAddress,
  CHECKPOINT_SOURCE
)
const checkpointDecider = new CompiledDecider(checkpointPredicate, {
  commitmentContract: Coder.encode(commitmentContractAddress)
})

const ownershipAddress = Address.from(
  '0x0000000000000000000000000000000000011111'
)
const ownershipPredicate = CompiledPredicate.fromSource(
  ownershipAddress,
  OWNERSHIP_SOURCE
)
const ownershipDecider = new CompiledDecider(ownershipPredicate)

const tokenAddress = Address.from('0x0000000000000000000000888880000000000000')

function createSU(
  start: number,
  end: number,
  blockNumber: number,
  owner: Address
) {
  return new StateUpdate(
    stateUpdateAddress,
    tokenAddress,
    new Range(BigNumber.from(start), BigNumber.from(end)),
    BigNumber.from(blockNumber),
    ownershipPredicate.makeProperty([Coder.encode(owner)])
  )
}

function createLeaf(su: StateUpdate) {
  return new DoubleLayerTreeLeaf(
    su.depositContractAddress,
    su.range.start,
    FixedBytes.from(
      32,
      Keccak256.hash(Coder.encode(su.stateObject.toStruct())).data
    )
  )
}

describe('Checkpoint', () => {
  let deciderManager: DeciderManager
  const wallet = new Wallet(
    '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'
  )
  const aliceAddress = Address.from(wallet.address)
  const aliceSU = createSU(0, 10, 1, aliceAddress)
  const signer = new Secp256k1Signer(Bytes.fromHexString(wallet.privateKey))

  const generator = new DoubleLayerTreeGenerator()
  const merkleTree = generator.generate([
    createLeaf(aliceSU),
    createLeaf(createSU(20, 30, 1, Address.default())),
    createLeaf(createSU(100, 120, 1, Address.default())),
    createLeaf(createSU(200, 201, 1, Address.default()))
  ])
  const root = merkleTree.getRoot()
  const inclusionProof = merkleTree.getInclusionProofByAddressAndIndex(
    tokenAddress,
    0
  )

  beforeEach(() => {
    deciderManager = initializeDeciderManager()
    deciderManager.setDecider(ownershipAddress, ownershipDecider)
    deciderManager.setDecider(checkpointAddress, checkpointDecider)
    deciderManager.setDecider(stateUpdateAddress, stateUpdateDecider)
  })

  test('checkpoint decides to true', async () => {
    // prepare witnesses
    // store state object for SU
    const soHint = replaceHint('so.block${b}.range${token},RANGE,${range}', {
      b: Coder.encode(aliceSU.blockNumber),
      token: Coder.encode(aliceSU.depositContractAddress),
      range: Coder.encode(aliceSU.range.toStruct())
    })
    await putWitness(
      deciderManager.witnessDb,
      soHint,
      Coder.encode(aliceSU.stateObject.toStruct())
    )

    // store proof for IncludedAt
    const proofHint = replaceHint(
      'proof.block${b}.range${token},RANGE,${range}',
      {
        b: Coder.encode(aliceSU.blockNumber),
        token: Coder.encode(aliceSU.depositContractAddress),
        range: Coder.encode(aliceSU.range.toStruct())
      }
    )
    await putWitness(
      deciderManager.witnessDb,
      proofHint,
      Coder.encode(inclusionProof.toStruct())
    )

    // store root hash to storage db and witness
    const rootHint = replaceHint('stored.${contract},KEY,${key}', {
      contract: Coder.encode(commitmentContractAddress),
      key: Coder.encode(aliceSU.blockNumber)
    })
    await putWitness(deciderManager.witnessDb, rootHint, Coder.encode(root))

    const storageDb = await deciderManager.getStorageDb()
    const bucket = await storageDb.bucket(
      Coder.encode(commitmentContractAddress)
    )
    await bucket.put(Coder.encode(aliceSU.blockNumber), Coder.encode(root))

    const checkpointInputs = [
      Bytes.fromString('CheckpointA'),
      Coder.encode(aliceSU.property.toStruct()),
      Coder.encode(inclusionProof.toStruct())
    ]

    const checkpointProperty = new Property(checkpointAddress, checkpointInputs)
    const decision = await checkpointDecider.decide(
      deciderManager,
      checkpointProperty.inputs
    )

    expect(decision.outcome).toBeTruthy()
  })
})
