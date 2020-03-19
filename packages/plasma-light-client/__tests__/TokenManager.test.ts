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

  beforeEach(async () => {
    mockApprove.mockClear()
    mockDecimals.mockClear()
    MockERC20Contract.mockClear()
    tokenManager = new TokenManager()
  })

  test('addTokenContract and getDecimals', async () => {
    const tokenAddress = Address.default()
    await tokenManager.addTokenContract(new MockERC20Contract(tokenAddress))
    expect(tokenManager.getDecimal(tokenAddress)).toEqual(6)
  })

  test('getDecimals throw exception', async () => {
    const tokenAddress = Address.default()
    expect(() => {
      tokenManager.getDecimal(tokenAddress)
    }).toThrow(`Token description(${tokenAddress.data}) not found.`)
  })
})
