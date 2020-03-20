import TokenManager from '../src/managers/TokenManager'
import { Integer, Address } from '@cryptoeconomicslab/primitives'
import { IERC20DetailedContract } from '@cryptoeconomicslab/contract'

const mockApprove = jest.fn()
const mockDecimals = jest.fn().mockImplementation(() => Integer.from(6))
const MockERC20Contract = jest.fn().mockImplementation((address: Address) => {
  return {
    approve: mockApprove,
    decimals: mockDecimals,
    address
  }
}) as jest.Mock<IERC20DetailedContract>

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
