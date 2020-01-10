import { Bytes, BigNumber, List } from '../../types/Codables'
import { ChallengeGame, Property } from '../../ovm'

export interface IAdjudicationContract {
  /**
   * Gets instantiated challenge game by gameId
   * @param gameId
   */
  getGame(gameId: Bytes): Promise<ChallengeGame>

  /**
   * Gets if a game is decided or not
   * @param gameId
   */
  isDecided(gameId: Bytes): Promise<boolean>

  /**
   * Claims property to create new game.
   * @param property
   */
  claimProperty(property: Property): Promise<void>

  /**
   * decide claim to true
   * @param gameId
   */
  decideClaimToTrue(gameId: Bytes): Promise<void>

  /**
   * decide claim to false
   * @param gameId
   * @param challengingGameId
   */
  decideClaimToFalse(gameId: Bytes, challengingGameId: Bytes): Promise<void>

  /**
   * remove challenge of a game
   * @param gameId
   * @param challengingGameId
   */
  removeChallenge(gameId: Bytes, challengingGameId: Bytes): Promise<void>

  /**
   * set predicate decision to decide a game
   * @param gameId
   * @param decision
   */
  setPredicateDecision(gameId: Bytes, decision: boolean): Promise<void>

  /**
   * challenge a game specified by gameId with a challengingGame specified by challengingGameId
   * @param gameId
   * @param challengeInputs
   * @param challengingGameId
   */
  challenge(
    gameId: Bytes,
    challengeInputs: List<Bytes>,
    challengingGameId: Bytes
  ): Promise<void>

  // subscribe methods
  subscribeAtomicPropositionDecided(
    handler: (gameId: Bytes, decision: boolean) => void
  ): void
  subscribeNewPropertyClaimed(
    handler: (
      gameId: Bytes,
      property: Property,
      createdBlock: BigNumber
    ) => void
  ): void
  subscribeClaimChallenged(
    handler: (gameId: Bytes, challengeGameId: Bytes) => void
  ): void
  subscribeClaimDecided(
    handler: (gameId: Bytes, decision: boolean) => void
  ): void
  subscribeChallengeRemoved(
    handler: (gameId: Bytes, challengeGameId: Bytes) => void
  ): void
}
