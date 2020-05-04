export const testSource = `@library
@quantifier("range,NUMBER,\${zero}-\${upper_bound}")
def LessThan(n, upper_bound) :=
  IsLessThan(n, upper_bound)
    
def test(a) := LessThan(a).all(b -> Bool(b) and Bool(b))
`

export const OWNERSHIP_SOURCE = `
@library
@quantifier("signatures,KEY,\${m}")
def SignedBy(sig, m, signer) := IsValidSignature(m, sig, signer, $secp256k1)
def ownership(owner, tx) := SignedBy(tx, owner).any()
`

export const STATEUPDATE_SOURCE = `
@library
def IsValidTx(tx, token, range, block_number) :=
  Equal(tx.address, $txAddress)
  and Equal(tx.0, token)
  and IsContained(range, tx.1)
  and IsLessThan(block_number, tx.2)

@library
@quantifier("tx.block\${b}.range\${token},RANGE,\${range}")
def Tx(tx, token, range, b) :=
  IsValidTx(tx, token, range, b)

def stateUpdate(token, range, block_number, so) :=
  Tx(token, range, block_number).any(tx ->
    so(tx)
  )
`

export const CHECKPOINT_SOURCE = `
@library
@quantifier("stored.\${contract},KEY,\${key}")
def Stored(value, contract, key) := IsStored(contract, key, value)

@library
@quantifier("proof.block\${b}.range\${token},RANGE,\${range}")
def IncludedAt(proof, leaf, token, range, b, commitmentContract) :=
  Stored(commitmentContract, b).any(root ->
    VerifyInclusion(leaf, token, range, proof, root)
  )

@library
@quantifier("range,NUMBER,\${zero}-\${upper_bound}")
def LessThan(n, upper_bound) :=
  IsLessThan(n, upper_bound)

@library
@quantifier("su.block\${b}.range\${token},RANGE,\${range}")
def SU(su, token, range, b) :=
  IncludedAt(su.3, token, range, b, $commitmentContract).any()

def checkpoint(su, proof) :=
  Stored($commitmentContract, su.2).any(root ->
    VerifyInclusion(su.3, su.0, su.1, proof, root)
  )
  and LessThan(su.2).all(b -> 
    SU(su.0, su.1, b).all(old_su -> old_su())
  )
`

export const EXIT_DEPOSIT_SOURCE = `
def exitDeposit(su, checkpoint) := !su()
`

export const EXIT_SOURCE = `
def exit(su, proof) := !su() and Checkpoint(su, proof)
`
