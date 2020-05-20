import TokenManager from '../src/managers/TokenManager'
import { Integer, Address } from '@cryptoeconomicslab/primitives'
import {
  IERC20DetailedContract,
  IDepositContract
} from '@cryptoeconomicslab/contract'

const mockApprove = jest.fn()
const mockName = jest.fn().mockImplementation(() => 'PlasmaETH')
const mockSymbol = jest.fn().mockImplementation(() => 'PETH')
const mockDecimals = jest.fn().mockImplementation(() => Integer.from(6))
const MockERC20Contract = jest.fn().mockImplementation((address: Address) => {
  return {
    approve: mockApprove,
    name: mockName,
    symbol: mockSymbol,
    decimals: mockDecimals,
    address
  }
}) as jest.Mock<IERC20DetailedContract>

const MockDepositContract = jest.fn().mockImplementation((address: Address) => {
  return { address }
}) as jest.Mock<IDepositContract>

describe('TokenManager', () => {
  let tokenManager: TokenManager
  const tokenAddress = Address.default()
  const depositContractAddress = Address.from(
    '0x0000000000000000000000000000000000000001'
  )

  beforeEach(async () => {
    mockApprove.mockClear()
    mockDecimals.mockClear()
    MockERC20Contract.mockClear()
    tokenManager = new TokenManager()
  })

  test('get depositContractAddresses', () => {
    tokenManager.addDepositContract(
      depositContractAddress,
      new MockDepositContract(depositContractAddress)
    )
    expect(tokenManager.depositContractAddresses).toEqual([
      depositContractAddress
    ])
  })

  test('add token', async () => {
    await tokenManager.addContracts(
      new MockERC20Contract(tokenAddress),
      new MockDepositContract(depositContractAddress)
    )
    const tokenContract = tokenManager.getTokenContract(depositContractAddress)
    expect(tokenContract).not.toBeUndefined()
    expect(tokenContract?.address).toEqual(tokenAddress)
    const depositContract = tokenManager.getDepositContract(
      depositContractAddress
    )
    expect(depositContract).not.toBeUndefined()
    expect(depositContract?.address).toEqual(depositContractAddress)
  })

  test('addTokenContract and getTokenContract', async () => {
    await tokenManager.addTokenContract(
      depositContractAddress,
      new MockERC20Contract(tokenAddress)
    )
    const tokenContract = tokenManager.getTokenContract(depositContractAddress)
    expect(tokenContract).not.toBeUndefined()
    expect(tokenContract?.address).toEqual(tokenAddress)
  })

  test('addDepositContract and getDepositContract', () => {
    tokenManager.addDepositContract(
      depositContractAddress,
      new MockDepositContract(depositContractAddress)
    )
    const depositContract = tokenManager.getDepositContract(
      depositContractAddress
    )
    expect(depositContract).not.toBeUndefined()
    expect(depositContract?.address).toEqual(depositContractAddress)
  })

  test('addTokenContract and getDecimals', async () => {
    await tokenManager.addTokenContract(
      depositContractAddress,
      new MockERC20Contract(tokenAddress)
    )
    expect(tokenManager.getDecimal(depositContractAddress)).toEqual(6)
  })

  test('getDecimals throw exception', async () => {
    expect(() => {
      tokenManager.getDecimal(depositContractAddress)
    }).toThrow(`Token Contract of (${depositContractAddress.data}) not found.`)
  })
})
