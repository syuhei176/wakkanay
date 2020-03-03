import axios from 'axios'
import { BigNumber } from '@cryptoeconomicslab/primitives'
import { StateUpdate, Transaction } from '@cryptoeconomicslab/plasma'

class APIClient {
  constructor(readonly endpoint: string) {}

  syncState(address: string, blockNumber: BigNumber) {
    return axios.get(
      `${
        this.endpoint
      }/sync_state?address=${address}&blockNumber=${blockNumber.data.toString()}`
    )
  }
  inclusionProof(su: StateUpdate) {
    return axios.get(
      `${
        this.endpoint
      }/inclusion_proof?blockNumber=${su.blockNumber.data.toString()}&stateUpdate=${ovmContext.coder
        .encode(su.property.toStruct())
        .toHexString()}`
    )
  }
  sendTransaction(tx: Transaction[] | Transaction) {
    const data = Array.isArray(tx)
      ? tx.map(x => ovmContext.coder.encode(x.toStruct()).toHexString())
      : ovmContext.coder.encode(tx.toStruct()).toHexString()

    return axios.post(`${this.endpoint}/send_tx`, {
      data
    })
  }
}

export default APIClient
