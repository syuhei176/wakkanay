import { setupContext } from '@cryptoeconomicslab/context'
import JsonCoder from '@cryptoeconomicslab/coder'
import { Address, Bytes } from '@cryptoeconomicslab/primitives'
import { executeChallenge, getGameId } from '../../src/helper/challenge'
import { Challenge, Property } from '@cryptoeconomicslab/ovm'
setupContext({ coder: JsonCoder })

const mockClaimProperty = jest.fn()
const mockIsDecided = jest.fn().mockResolvedValue(true)
const mockIsDecidable = jest.fn().mockResolvedValue(true)
const mockDecideClaimToTrue = jest.fn()
const mockChallenge = jest.fn()
const mockGetClaimedProperties = jest.fn().mockResolvedValue([])
const mockDecideClaimWithWitness = jest.fn()

const MockAdjudicationContract = jest.fn().mockImplementation(() => {
  return {
    isDecided: mockIsDecided,
    isDecidable: mockIsDecidable,
    decideClaimToTrue: mockDecideClaimToTrue,
    challenge: mockChallenge,
    claimProperty: mockClaimProperty,
    getClaimedProperties: mockGetClaimedProperties,
    decideClaimWithWitness: mockDecideClaimWithWitness
  }
})

const witnesses = [Bytes.default()]
const MockDeciderManager = jest.fn().mockImplementation(() => {
  return {
    decide: jest.fn().mockResolvedValue({ outcome: true, witnesses })
  }
})

const MockDeciderManagerFalse = jest.fn().mockImplementation(() => {
  return {
    decide: jest.fn().mockResolvedValue({ outcome: false })
  }
})

describe('challenge', () => {
  const gameId = Bytes.default()
  const challenge: Challenge = {
    property: new Property(Address.default(), []),
    challengeInput: Bytes.default()
  }
  const challengeGameId = getGameId(challenge.property)

  beforeEach(async () => {
    MockAdjudicationContract.mockClear()
    mockDecideClaimWithWitness.mockClear()
  })

  describe('executeChallenge', () => {
    test('executeChallenge calls decideClaimWithWitness', async () => {
      await executeChallenge(
        new MockAdjudicationContract(),
        new MockDeciderManager(),
        gameId,
        challenge
      )
      expect(mockClaimProperty).toHaveBeenCalled()
      expect(mockChallenge).toHaveBeenCalled()
      expect(mockDecideClaimWithWitness).toHaveBeenCalledWith(
        challengeGameId,
        witnesses
      )
    })

    test("executeChallenge doesn't calls decideClaimWithWitness", async () => {
      await executeChallenge(
        new MockAdjudicationContract(),
        new MockDeciderManagerFalse(),
        gameId,
        challenge
      )
      expect(mockClaimProperty).toHaveBeenCalled()
      expect(mockChallenge).toHaveBeenCalled()
      expect(mockDecideClaimWithWitness).not.toHaveBeenCalled()
    })
  })
})
