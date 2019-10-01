import { IKeyValueStore } from './db/IKeyValueStore'
import { Address, IProperty, IDecision } from './types'

class OVM {
  private adjudicationContractAddress: Address
  private database: IKeyValueStore

  /**
   * constructor of OVM instance
   * @constructor
   * @param {{ adjudicationContractAddress: Address, database: IKeyValueStore }} constructorParams
   */
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

  /**
   * make decision on property locally.
   * if decision is cachsed, return the cashed decision otherwise,
   * decider logic will be executed right away.
   * @param {IProperty} property
   */
  public async makeDecision(property: IProperty) {
    console.log('make decision: ', property)
  }

  /**
   * claim a property to adjudication contract
   * @param {IProperty} property
   */
  public async makeClaim(property: IProperty) {
    console.log('make claim: ', property)
  }

  /**
   * fetch contract decision from contract
   * @param {IProperty} property
   */
  public async fetchDecision(property: IProperty) {
    console.log('fetch contract decision: ', property)
  }

  /**
   * deposit state to deposit contract
   * @param {any} state state to deposit to contract
   * @param {Address} depositContractAddress deposit contract address
   */
  public async deposit(state: any, depositContractAddress: Address) {
    console.log('deposit')
  }

  /**
   * try exitting from contract address
   * @param {any} state state to exit from contract
   * @param {Address} depositContractAddress deposit contract address
   */
  public async exit(state: any, depositContractAddress: Address) {
    console.log('exit')
  }

  /**
   * withdraw depositted state to ethereum account
   * @param {any} state state to withdraw from contract address
   * @param {Address} depositContractAddress deposit contract address
   */
  public async withdraw(state: any, depositContractAddress: Address) {
    console.log('withdraw')
  }

  /**
   * subscribe decision event of a property
   * @param {IProperty} property property to subscribe decision event
   * @param {(decision: IDecision) => undefined} handler
   */
  public subscribeDecision(
    property: IProperty,
    handler: (decision: IDecision) => undefined
  ) {
    console.log('subscribe to property decide event', property)
  }

  /**
   * unsubscribe decision event of a property
   * @param {IProperty} property
   */
  public unsubscribeDecision(property: IProperty) {
    console.log('unsubscribe from property decided event', property)
  }
}
