import { Keccak256 } from '@cryptoeconomicslab/hash'
import { Bytes, List } from '@cryptoeconomicslab/primitives'
import { Challenge, DeciderManager, Property } from '@cryptoeconomicslab/ovm'
import { IAdjudicationContract } from '@cryptoeconomicslab/contract'

/**
 * @name executeChallenge
 * @description execute challenge procedure to game with challenge property
 * @param adjudicationContract
 * @param deciderManager
 * @param gameId Id of the game to challenge
 * @param challenge challenge data structure
 */
export async function executeChallenge(
  adjudicationContract: IAdjudicationContract,
  deciderManager: DeciderManager,
  gameId: Bytes,
  challenge: Challenge
) {
  const challengingGameId = getGameId(challenge.property)
  await adjudicationContract.claimProperty(challenge.property)
  await adjudicationContract.challenge(
    gameId,
    challenge.challengeInput
      ? List.from(Bytes, [challenge.challengeInput])
      : List.from(Bytes, []),
    challengingGameId
  )
  const decisionOfCounterClaim = await deciderManager.decide(challenge.property)
  if (decisionOfCounterClaim.outcome && decisionOfCounterClaim.witnesses) {
    // decide claim if it's needed.
    await adjudicationContract.decideClaimWithWitness(
      challengingGameId,
      decisionOfCounterClaim.witnesses
    )
    await adjudicationContract.decideClaimToFalse(gameId, challengingGameId)
  } else {
    // TODO: how do we notify user of malicious case happening
    console.warn(`We did challenge, but the challenge hasn't decided yet.`)
  }
}

export function getGameId(property: Property) {
  return Keccak256.hash(ovmContext.coder.encode(property.toStruct()))
}
