import {
  IERC20DetailedContract,
  IDepositContract
} from '@cryptoeconomicslab/contract'
import { Integer, Address } from '@cryptoeconomicslab/primitives'

/**
 * @description TokenManager manages token contracts and deposit contracts
 */
export default class TokenManager {
  private depositContractAddressStrings: Set<string> = new Set()
  private depositContracts: Map<string, IDepositContract> = new Map()
  private tokenContracts: Map<string, IERC20DetailedContract> = new Map()
  private tokenNames: Map<string, string> = new Map()
  private tokenSymbols: Map<string, string> = new Map()
  private tokenDecimals: Map<string, Integer> = new Map()
  private contractAddressMap: Map<string, string> = new Map() // key: tokenContractAddress, value: depositContractAddress

  get depositContractAddresses(): Address[] {
    return Array.from(this.depositContractAddressStrings).map(addr =>
      Address.from(addr)
    )
  }

  /**
   * add pair of ERC20 contract and Deposit contract to be managed
   * @param erc20Contract ERC20 contract to add
   * @param depositContract Deposit contract to add
   */
  async addContracts(
    erc20Contract: IERC20DetailedContract,
    depositContract: IDepositContract
  ) {
    const depositContractAddress = depositContract.address
    this.addDepositContract(depositContractAddress, depositContract)
    await this.addTokenContract(depositContractAddress, erc20Contract)
    this.contractAddressMap.set(
      erc20Contract.address.data,
      depositContract.address.data
    )
  }

  /**
   * Add Deposit Contract with key of Deposit Contract's address.
   * @param depositContractAddress address of deposit contract
   * @param depositContract Instance of DepositContract
   */
  addDepositContract(
    depositContractAddress: Address,
    depositContract: IDepositContract
  ) {
    this.depositContracts.set(depositContractAddress.data, depositContract)
    this.depositContractAddressStrings.add(depositContractAddress.data)
  }

  /**
   * get deposit contract by address
   * @param depositContractAddress address of deposit contract
   */
  getDepositContract(
    depositContractAddress: Address
  ): IDepositContract | undefined {
    return this.depositContracts.get(depositContractAddress.data)
  }

  /**
   * get deposit contract address by token contract address
   * @param addr address of token contract
   */
  getDepositContractAddress(addr: Address): string | undefined {
    return this.contractAddressMap.get(addr.data)
  }

  /**
   * Add Token Contract with key of Deposit Contract's address.
   * @param depositContractAddress The address of Deposit Contract
   * @param erc20Contract Instance of ERC20Contract
   */
  async addTokenContract(
    depositContractAddress: Address,
    erc20Contract: IERC20DetailedContract
  ) {
    this.tokenContracts.set(depositContractAddress.data, erc20Contract)
    const name = await erc20Contract.name()
    const symbol = await erc20Contract.symbol()
    const decimals = await erc20Contract.decimals()
    this.tokenNames.set(erc20Contract.address.data, name)
    this.tokenSymbols.set(erc20Contract.address.data, symbol)
    this.tokenDecimals.set(erc20Contract.address.data, decimals)
    this.contractAddressMap.set(
      depositContractAddress.data,
      erc20Contract.address.data
    )
  }

  /**
   * Get Token Contract by deposit contract address.
   * @param depositContractAddress The address of Deposit Contract
   */
  getTokenContract(
    depositContractAddress: Address
  ): IERC20DetailedContract | undefined {
    return this.tokenContracts.get(depositContractAddress.data)
  }

  /**
   * Get name of token by deposit contract address.
   * @param depositContractAddress The address of Deposit Contract
   * @returns Returns the token name.
   */
  getName(depositContractAddress: Address): string {
    const tokenContract = this.getTokenContract(depositContractAddress)
    if (!tokenContract) {
      throw new Error(
        `Token Contract of (${depositContractAddress.data}) not found.`
      )
    }
    const name = this.tokenNames.get(tokenContract.address.data)
    if (!name) {
      throw new Error(
        `Token description(${tokenContract.address.data}) name not found.`
      )
    }
    return name
  }

  /**
   * Get symbol of token by deposit contract address.
   * @param depositContractAddress The address of Deposit Contract
   * @returns Returns the symbol value which usually a shorter value of the token's name.
   */
  getSymbol(depositContractAddress: Address): string {
    const tokenContract = this.getTokenContract(depositContractAddress)
    if (!tokenContract) {
      throw new Error(
        `Token Contract of (${depositContractAddress.data}) not found.`
      )
    }
    const symbol = this.tokenSymbols.get(tokenContract.address.data)
    if (!symbol) {
      throw new Error(
        `Token description(${tokenContract.address.data}) symbol not found.`
      )
    }
    return symbol
  }

  /**
   * Get decimal of token by deposit contract address.
   * @param depositContractAddress The address of Deposit Contract
   * @returns Retuens decimal value which indicates how many "0"s there are to the right of the decimal point in token representation.
   */
  getDecimal(depositContractAddress: Address): number {
    const tokenContract = this.getTokenContract(depositContractAddress)
    if (!tokenContract) {
      throw new Error(
        `Token Contract of (${depositContractAddress.data}) not found.`
      )
    }
    const decimals = this.tokenDecimals.get(tokenContract.address.data)
    if (!decimals) {
      throw new Error(
        `Token description(${tokenContract.address.data}) decimals not found.`
      )
    }
    return decimals.data
  }
}
