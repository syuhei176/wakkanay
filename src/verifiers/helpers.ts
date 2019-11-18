import SignatureVerifier from './SignatureVerifier'
import { secp256k1Verifier } from './Secp256k1'
import { ed25519Verifier } from './Ed25519'

const SignatureVerifierMap: {
  [key: string]: SignatureVerifier
} = {
  secp256k1: secp256k1Verifier,
  ed25519: ed25519Verifier
}

export const getSignatureVerifier = (key: string): SignatureVerifier => {
  if (!Object.keys(SignatureVerifierMap).includes(key)) {
    throw new Error('Invalid signature verifier map key')
  }

  return SignatureVerifierMap[key]
}
