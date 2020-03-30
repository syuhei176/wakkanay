import { deployContract } from 'ethereum-waffle'
import { ContractJSON } from 'ethereum-waffle/lib/ContractJSON'
import ethers from 'ethers'
import { TestCaseSet, TestContext } from './testCase'

/**
 * @name deployCompiledPredicate
 * @description This is test utility.
 *      Deploy CompiledPredicate for unit test
 * @param wallet wallet instance of ethers.js
 * @param Utils ContractJSON of Util contract
 * @param AdjudicationContract ContractJSON of Adjudication contract
 * @param testCase
 * @param testContext
 */
export async function deployCompiledPredicate(
  wallet: ethers.Wallet,
  Utils: ContractJSON,
  AdjudicationContract: ContractJSON,
  testCase: TestCaseSet,
  testContext: TestContext
) {
  const utils = await deployContract(wallet, Utils, [])
  const adjudicationContract = await deployContract(
    wallet,
    AdjudicationContract,
    [false]
  )
  let targetPredicate: ethers.Contract | undefined
  for await (const d of testCase.deploy) {
    targetPredicate = await deployContract(
      wallet,
      d.contract,
      [
        adjudicationContract.address,
        utils.address,
        testContext.not,
        testContext.and,
        testContext.forAllSuchThat
      ].concat(d.getExtraArgs(testContext)),
      { gasLimit: testContext.gasLimit }
    )
    testContext.deployedContractAddresses.push(targetPredicate.address)
    await targetPredicate.setPredicateAddresses(
      testContext.mockAtomicPredicate,
      testContext.mockAtomicPredicate,
      testContext.mockAtomicPredicate,
      testContext.mockAtomicPredicate,
      testContext.mockAtomicPredicate,
      testContext.mockAtomicPredicate,
      testContext.mockAtomicPredicate,
      testContext.mockAtomicPredicate,
      testContext.mockAtomicPredicate,
      testContext.payout
    )
  }
  if (!targetPredicate) throw new Error('testCase.deploy must not be empty')
  return targetPredicate
}
