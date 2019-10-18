import * as DB from './db'
import { Address, Property, Decision, Bytes } from './types'

class OVM {
  private adjudicationContractAddress: Address
  private database: DB.KeyValueStore
  private rangeDatabase: DB.RangeStore

  /**
   * constructor of OVM instance
   * @constructor
   * @param {{ adjudicationContractAddress: Address, database: IKeyValueStore }} constructorParams
   */
  constructor({
    adjudicationContractAddress,
    database,
    rangeDatabase
  }: {
    adjudicationContractAddress: Address
    database: DB.KeyValueStore
    rangeDatabase: DB.RangeStore
  }) {
    this.adjudicationContractAddress = adjudicationContractAddress
    this.database = database
    this.rangeDatabase = rangeDatabase
  }

  /**
   * TODO: implement
   * make decision on property locally.
   * if decision is cachsed, return the cashed decision otherwise,
   * decider logic will be executed right away.
   * @param {Property} property
   */
  public async makeDecision(property: Property): Promise<Decision> {
    console.log('make decision: ', property)

    return Promise.resolve({ outcome: true })
  }

  /**
   * TODO: implement
   * claim a property to adjudication contract
   * @param {Property} property
   */
  public async makeClaim(property: Property): Promise<void> {
    console.log('make claim: ', property)
  }

  /**
   * TODO: implement
   * fetch contract decision from contract
   * @param {Property} property
   */
  public async fetchDecision(property: Property): Promise<Decision> {
    console.log('fetch contract decision: ', property)

    return Promise.resolve({ outcome: true })
  }

  /**
   * TODO: implement
   * deposit state to deposit contract
   * @param {any} state state to deposit to contract
   * @param {Address} depositContractAddress deposit contract address
   */
  public async deposit(
    state: any,
    depositContractAddress: Address
  ): Promise<void> {
    console.log('deposit')
  }

  /**
   * TODO: implement
   * try exitting from contract address
   * @param {any} state state to exit from contract
   * @param {Address} depositContractAddress deposit contract address
   */
  public async exit(
    state: any,
    depositContractAddress: Address
  ): Promise<void> {
    console.log('exit')
  }

  /**
   * TODO: implement
   * withdraw depositted state to ethereum account
   * @param {any} state state to withdraw from contract address
   * @param {Address} depositContractAddress deposit contract address
   */
  public async withdraw(
    state: any,
    depositContractAddress: Address
  ): Promise<void> {
    console.log('withdraw')
  }

  /**
   * TODO: implement
   * subscribe decision event of a property
   * @param {Property} property property to subscribe decision event
   * @param {(decision: Decision) => undefined} handler
   */
  public subscribeDecision(
    property: Property,
    handler: (decision: Decision) => undefined
  ) {
    console.log('subscribe to property decide event', property)
  }

  /**
   * TODO: implement
   * unsubscribe decision event of a property
   * @param {Property} property
   */
  public unsubscribeDecision(property: Property) {
    console.log('unsubscribe from property decided event', property)
  }

  /**
   * TODO: implement
   * get kvs witness store prefix with given key
   * @param {Bytes} key prefix
   */
  public store(key: Bytes): DB.WitnessStore {
    return DB.createWitnessStore(this.database.bucket(key))
  }

  /**
   * TODO: implement
   * get range witness store prefix with given key
   * @param {Bytes} key prefix
   */
  public rangeStore(key: Bytes): DB.RangeWitnessStore {
    return DB.createRangeWitnessStore(this.rangeDatabase.bucket(key))
  }
}
