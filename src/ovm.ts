import { IKeyValueStore } from './db/IKeyValueStore'
import { Address } from './types'

class OVM {
  private adjudicationContractAddress: Address
  private database: IKeyValueStore

  constructor({
    adjudicationContractAddress,
    database
  }: {
    adjudicationContractAddress: Address
    database: IKeyValueStore
  }) {
    this.adjudicationContractAddress = adjudicationContractAddress
    this.database = database
  }
}
