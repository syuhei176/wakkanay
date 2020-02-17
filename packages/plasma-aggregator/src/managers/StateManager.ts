import {
  StateUpdate,
  Transaction,
  StateUpdateRecord,
  DepositTransaction
} from '@cryptoeconomicslab/plasma'
import {
  DeciderManager,
  Property,
  CompiledPredicate
} from '@cryptoeconomicslab/ovm'
import {
  Bytes,
  Address,
  BigNumber,
  Range
} from '@cryptoeconomicslab/primitives'
import {
  RangeDb,
  RangeStore,
  KeyValueStore,
  putWitness,
  replaceHint
} from '@cryptoeconomicslab/db'
import { decodeStructable } from '@cryptoeconomicslab/coder'
import JSBI from 'jsbi'

export default class StateManager {
  constructor(private db: RangeStore) {}

  public async resolveStateUpdates(
    start: BigNumber,
    end: BigNumber
  ): Promise<StateUpdate[]> {
    return (await this.db.get(start.data, end.data)).map(
      StateUpdate.fromRangeRecord
    )
  }

  /**
   * given transaction, execute state transition on
   * existing state updates with gaiven range and returns new state update.
   * if transaction is invalid, throws.
   * @param tx transaction
   * @param nextBlockNumber next block number
   * @param deciderManager decider manager
   */
  public async executeStateTransition(
    tx: Transaction,
    nextBlockNumber: BigNumber,
    deciderManager: DeciderManager
  ): Promise<StateUpdate> {
    console.log('execute state transition', tx.range)
    const range = tx.range

    const prevStates = (
      await this.db.get(range.start.data, range.end.data)
    ).map(r => {
      return StateUpdate.fromRecord(
        decodeStructable(StateUpdateRecord, ovmContext.coder, r.value),
        new Range(r.start, r.end)
      )
    })

    if (prevStates.length === 0) {
      throw new Error('InvalidTransaction')
    }

    // if multiple prevStates found but they're not contigious
    const contigious = prevStates.reduce(
      ({ prevEnd, result }, current) => {
        if (!result) return { prevEnd, result }
        return {
          prevEnd: current.range.end,
          result: JSBI.equal(prevEnd.data, current.range.start.data)
        }
      },
      { prevEnd: prevStates[0].range.start, result: true }
    ).result

    if (!contigious) {
      throw new Error('InvalidTransaction')
    }

    // update intersected ranges
    if (JSBI.lessThan(prevStates[0].range.start.data, tx.range.start.data)) {
      prevStates[0].update({
        range: new Range(tx.range.start, prevStates[0].range.end)
      })
    }

    const last = prevStates.length - 1
    if (JSBI.greaterThan(prevStates[last].range.end.data, tx.range.end.data)) {
      prevStates[last].update({
        range: new Range(prevStates[last].range.start, tx.range.end)
      })
    }

    await this.storeWitness(
      deciderManager.witnessDb,
      tx,
      prevStates.map(s => s.blockNumber),
      prevStates.map(s => s.range)
    )

    const decisions = await Promise.all(
      prevStates.map(async state => {
        return await deciderManager.decide(state.property)
      })
    )

    if (decisions.some(d => !d.outcome)) {
      throw new Error('InvalidTransaction')
    }

    const inputs: Bytes[] = [
      tx.depositContractAddress,
      tx.range.toStruct(),
      nextBlockNumber,
      tx.stateObject.toStruct(),
      tx.range.toStruct()
    ].map(ovmContext.coder.encode)

    const nextStateUpdate = StateUpdate.fromProperty(
      new Property(
        (deciderManager.compiledPredicateMap.get(
          'StateUpdate'
        ) as CompiledPredicate).deployedAddress,
        inputs
      )
    )

    await this.db.put(
      tx.range.start.data,
      tx.range.end.data,
      ovmContext.coder.encode(nextStateUpdate.toRecord().toStruct())
    )

    return nextStateUpdate
  }

  /**
   * insert a range into state db when deposited
   * @param tx deposit transaction
   * @param blockNumber block number at which coin range is added
   */
  public async insertDepositRange(
    tx: DepositTransaction,
    blockNumber: BigNumber
  ) {
    console.log('insertDepositRange: ', tx)
    const stateUpdate = StateUpdate.fromProperty(tx.stateUpdate)
    stateUpdate.update({ blockNumber })
    await this.db.put(
      stateUpdate.range.start.data,
      stateUpdate.range.end.data,
      ovmContext.coder.encode(stateUpdate.toRecord().toStruct())
    )
  }

  /**
   * query ownership state updates
   * @param addr owner address
   */
  public async queryOwnershipyStateUpdates(
    ownershipPredicateAddress: Address,
    addr: Address,
    blockNumber?: BigNumber
  ) {
    return (await this.db.get(JSBI.BigInt(0), JSBI.BigInt(10000)))
      .map(StateUpdate.fromRangeRecord)
      .filter(su =>
        blockNumber ? JSBI.equal(su.blockNumber.data, blockNumber.data) : true
      )
      .filter(su => {
        const owner = Address.from(su.stateObject.inputs[0].toHexString())
        return (
          su.stateObject.deciderAddress.data ==
            ownershipPredicateAddress.data && owner.data === addr.data
        )
      })
  }

  /**
   * // TODO: use putWitness to store data
   * store transaction and signature to witness database
   * @param witnessDb witness database
   * @param tx transaction data
   */
  private async storeWitness(
    witnessDb: KeyValueStore,
    tx: Transaction,
    prevBlockNumbers: BigNumber[],
    prevStateRanges: Range[]
  ) {
    const signaturesBucket = await witnessDb.bucket(
      Bytes.fromString('signatures')
    )
    const txBucket = await witnessDb.bucket(Bytes.fromString('tx'))
    for await (const [index, prevBlockNumber] of prevBlockNumbers.entries()) {
      const blockBucket = await txBucket.bucket(
        Bytes.fromString(
          'block' + ovmContext.coder.encode(prevBlockNumber).toHexString()
        )
      )
      const rangeBucket = await blockBucket.bucket(
        Bytes.fromString(
          'range' +
            ovmContext.coder.encode(tx.depositContractAddress).toHexString()
        )
      )
      const rangeDb = new RangeDb(rangeBucket)
      const message = ovmContext.coder.encode(
        tx.toProperty(Address.default()).toStruct()
      )
      await signaturesBucket.put(message, tx.signature)
      await rangeDb.put(
        prevStateRanges[index].start.data,
        prevStateRanges[index].end.data,
        message
      )
    }
  }
}
