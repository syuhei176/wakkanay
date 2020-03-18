export interface PlasmaContractConfig {
  adjudicationContract: string
  commitmentContract: string
  payoutContracts: {
    OwnershipPayout: string
    DepositContract: string
  }
}
