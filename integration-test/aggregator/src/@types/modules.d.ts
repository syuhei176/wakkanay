declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string
    BLOCK_INTERVAL: string
    MAIN_CHAIN_HOST: string
    AGGREGATOR_PRIVATE_KEY: string
    DEPOSIT_CONTRACT_ADDRESS: string
    COMMITMENT_CONTRACT_ADDRESS: string
    TOKEN_ADDRESS: string
    UNIVERSAL_ADJUDICATION_CONTRACT_ADDRESS: string
    THERE_EXISTS_ADDRESS: string
    IS_VALID_SIG_ADDRESS: string
    DB_USER: string
    DB_HOST: string
    DB_NAME: string
    DB_PORT: string
  }
}
